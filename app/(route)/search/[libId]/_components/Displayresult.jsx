"use client"
import React, { useEffect, useState } from 'react'
import { LucideImage, LucideList, LucideSparkles, LucideVideo } from 'lucide-react';
import AnswerDisplay from './AnswerDisplay'
import axios from 'axios';
// import { searchRes } from '../../../../../services/Shared'
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../services/supabase'

const tabs = [
    { label: 'Answer', icon: LucideSparkles },
    { label: 'Images', icon: LucideImage },
    { label: 'Videos', icon: LucideVideo },
    { label: 'Sources', icon: LucideList, badge: 10 },
];

function Displayresult({ searchInputRecord }) {
    const [activeTab, setActiveTab] = useState('Answer')
    const [searchResult, setSearchResult] = useState(searchInputRecord)
    const { libId } = useParams();
    useEffect(() => {
        //update this method:=> only search when chat table is empty 
        console.log('handleing searchInputRecord');

        // searchInputRecord && GetSearchApiResult();
        console.log(searchInputRecord);
        !searchInputRecord?.Chats && GetSearchApiResult();

        setSearchResult(searchInputRecord)

        // console.log(searchInputRecord);
        // if (searchInputRecord?.searchInput) {
        // GetSearchApiResult();
        // }
    }, [searchInputRecord])
    const GetSearchApiResult = async () => {
        console.log('handleing GetSearchApiResult');
        const result = await axios.post('/api/brave-search-api', {
            searchInput: searchInputRecord?.searchInput,
            searchType: searchInputRecord?.type
        });
        // console.log(JSON.stringify(result.data))
        // console.log("result.data from axios.post /api/brave-search-api:", result.data)
        // console.log(result.data);
        // console.log(JSON.stringify(result.data));

        //save to DB
        const searchResp = result.data;
        setSearchResult({
            ...searchInputRecord,
            ...searchResp  // Brave 返回的 web、sources 等
        });
        // setSearchResult(searchResp)
        // console.log(searchResult);
        // const searchResp = searchRes;
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
            .upsert(
                {
                    libid: libId,
                    searchResult: formattedSearchResp,
                    userSearchInput: searchInputRecord?.searchInput
                },
                { onConflict: ['libid'] } // 👈 以 libid 判断冲突
            )
            .select();
        // console.log(data);
        // console.log(searchResult);
        //pass to LLM Model
        await GenerateAIResp(formattedSearchResp, data[0].id)

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
            <h2 className='font-medium text-3xl line-clamp-2'>{searchInputRecord?.searchInput}</h2>
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
                    <AnswerDisplay searchResult={searchResult} /> : null}
            </div>

        </div>
    )
}

export default Displayresult