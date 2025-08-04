"use client"
import React, { useEffect, useState } from 'react'
import { Loader2Icon, LucideImage, LucideList, LucideSparkles, LucideVideo, Send } from 'lucide-react';
import AnswerDisplay from './AnswerDisplay'
import ImageListTab from './ImageListTab'
import axios from 'axios';
// import { searchRes } from '../../../../../services/Shared'
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../services/supabase'
import { Button } from '@/components/ui/button';

import OpenAI from 'openai';

const tabs = [
    { label: 'Answer', icon: LucideSparkles },
    { label: 'Images', icon: LucideImage },
    { label: 'Videos', icon: LucideVideo },
    { label: 'Sources', icon: LucideList, badge: 10 },
];

function Displayresult({ searchInputRecord }) {
    const [hasUserTriggered, setHasUserTriggered] = useState(false);
    const [activeTab, setActiveTab] = useState('Answer')
    const [searchResult, setSearchResult] = useState(searchInputRecord)
    const [UserInput, setUserInput] = useState()
    const [loadingSearch, setloadingSearch] = useState(false)
    const { libId } = useParams();
    useEffect(() => {
        //update this method:=> only search when chat table is empty 
        // console.log('handleing searchInputRecord');

        // searchInputRecord && GetSearchApiResult();
        // console.log(searchInputRecord);
        // !searchInputRecord?.Chats && GetSearchApiResult();
        if (!hasUserTriggered && searchInputRecord?.Chats?.length === 0) {
            GetSearchApiResult();
        } else {
            GetSearchRecord();
        }
        setSearchResult(searchInputRecord)

        // console.log(searchInputRecord);
        // if (searchInputRecord?.searchInput) {
        // GetSearchApiResult();
        // }
    }, [searchInputRecord])
    const GetSearchApiResult = async () => {
        setHasUserTriggered(true);
        setloadingSearch(true)
        // console.log('handleing GetSearchApiResult');
        const result = await axios.post('/api/brave-search-api', {
            searchInput: UserInput ?? searchInputRecord?.searchInput,
            searchType: searchInputRecord?.type ?? 'Search'
        });
        console.log(result.data);
        const openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });

        //save to DB
        const searchResp = result.data;
        setSearchResult({
            ...searchInputRecord,
            ...searchResp  
        });
        
        const formattedSearchResp = searchResp?.web?.results?.map((item, index) => (
            {
                title: item?.title,
                description: item?.description,
                long_name: item?.profile?.long_name,
                img: item?.profile?.img,
                url: item?.url,
                thumbnail: item?.thumbnail?.src
            }
        ))
        // console.log(formattedSearchResp);

        //fetch latest from DB

        const { data, error } = await supabase
            .from('Chats')
            .insert(
                {
                    libid: libId,
                    searchResult: formattedSearchResp,
                    userSearchInput: searchInputRecord?.searchInput
                },

            )
            .select();

        //pass to LLM Model

        const formatted = searchResp?.web?.results?.map((item) => ({
            content: `${item?.title ?? ''}\n${item?.description ?? ''}`,
            url: item?.url,
        }));

        for (const item of formatted) {
            if (!item.content) continue;

            try {
                const embeddingResp = await openai.embeddings.create({
                    input: item.content,
                    model: "text-embedding-3-small",
                });

                const [{ embedding }] = embeddingResp.data;

                const { error } = await supabase.from("semantic_results").insert({
                    libid: libId,
                    content: item.content,
                    url: item.url,
                    embedding,
                });

                if (error) {
                    console.error("Insert error:", error);
                }
            } catch (err) {
                console.error("Embedding error:", err);
            }
        }

        // 1. input embedding
        const input = await openai.embeddings.create({
            input: searchInputRecord?.searchInput,
            model: "text-embedding-3-small",
        });
        const [{ embedding }] = input.data;

        // 2. invoke the Postgres custom RPC function
        const { data: matches, e } = await supabase
            .rpc("match_semantic_results", {
                query_embedding: embedding,
                match_threshold: 0.85, 
                match_count: 6
            });
        if (e) {
            console.error("Semantic match error:", e);
        } else {
            console.log("Top matching results:", matches);
        }


        setloadingSearch(false)
        await GenerateAIResp(matches, data[0].id)

    }
    const GetSearchRecord = async () => {
        const { data: newData, error } = await supabase
            .from('Library')
            .select('*, Chats(*)')
            .eq('libid', libId);

        if (newData && newData[0]) {
            // 合并新的 aiResp 到当前 searchResult
            setSearchResult(prev => ({
                ...prev,
                Chats: newData[0].Chats  // 替换/补充 Chats 字段
            }));
        }

    }
    const GenerateAIResp = async (formattedSearchResp, recordId) => {
        const result = await axios.post('/api/llm-model', {
            searchInput: searchInputRecord?.searchInput,
            searchResult: formattedSearchResp,
            recordId: recordId
        })
        // console.log(result.data);
        const runId = result.data
        const interval = setInterval(async () => {
            const runResp = await axios.post('/api/get-inngest-status', {
                runId: runId
            });
            // console.log(runResp.data);
            if (runResp?.data?.data[0]?.status == 'Completed') {
                console.log('completed!!!')
                clearInterval(interval)
                //get undated data from DB
                const { data: newData, error } = await supabase
                    .from('Library')
                    .select('*, Chats(*)')
                    .eq('libid', libId);

                if (newData && newData[0]) {
                    // 合并新的 aiResp 到当前 searchResult
                    setSearchResult(prev => ({
                        ...prev,
                        Chats: newData[0].Chats  // 替换/补充 Chats 字段
                    }));
                }
            }

        }, 1000)

        // setSearchResult(searchResp)
        // setSearchResult(searchInputRecord)
        // console.log(searchResult);

    }
    return (
        <div className='mt-7'>
            {searchResult?.Chats?.map((chat, index) => (
                <div key={index}>
                    <h2 className='font-medium text-3xl line-clamp-2'>{chat?.searchInput}</h2>
                    <div className="flex items-center space-x-6 border-b border-gray-200 pb-2 mt-6">
                        {tabs.map(({ label, icon: Icon, badge }) => (
                            <button
                                key={label}
                                onClick={() => setActiveTab(label)}
                                className={`flex items-center gap-1 relative text-sm font-medium text-gray-700 hover:text-black ${activeTab === label ? 'text-black' : ''
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                                {badge && (
                                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                        {badge}
                                    </span>
                                )}
                                {activeTab === label && (
                                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black rounded"></span>
                                )}
                            </button>
                        ))}
                        <div className="ml-auto text-sm text-gray-500">
                            1 task <span className="ml-1">↗</span>
                        </div>
                    </div>
                    <div>
                        {activeTab == 'Answer' ?
                            <AnswerDisplay chat={chat} /> :
                            activeTab == 'Images' ?
                                <ImageListTab chat={chat} /> :
                                null}
                    </div>
                </div>
            ))}


            <div className='bg-white w-full border rounded-lg 
            shadow-md p-3 px-5 flex justify-between fiexd bottom-6 max-w-md lg:max-w-xl'>
                <input placeholder="Type Anything" className='outline-none'
                    onChange={(e) => setUserInput(e.target.value)} />
                {UserInput?.length &&
                    <Button onClick={GetSearchApiResult} >
                        {loadingSearch ? <Loader2Icon className='animate-spin' /> : <Send />}</Button>}
            </div>
        </div>
    )
}

export default Displayresult