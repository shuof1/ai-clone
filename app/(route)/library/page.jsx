"use client"
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase';
import moment from 'moment';
import { SquareArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
function Library() {
    const { user } = useUser();
    const [libraryHistory, setlibraryHistory] = useState();
    const router=useRouter();
    useEffect(() => {
        GetLibraryHistory();
    }, [user])
    const GetLibraryHistory = async () => {
        let { data: Library, error } = await supabase
            .from('Library')
            .select('*')
            .eq('userEmail', user?.primaryEmailAddress?.emailAddress)
            .order('id', { ascending: false })
        console.log(Library)
        setlibraryHistory(Library);
    }
    return (
        <div className='px-10 md:px-20 lg:px-36 xl:px-56 mt-20'>
            <h2 className='font-bold text-2xl'>Lib</h2>
            <div className='mb-7'>
                {libraryHistory?.map((item, index) => (
                    <div key={index} className='cursor-pointer' onClick={()=>router.push('/search/'+item.libid)}>
                        <div className='flex justify-between'>
                            <div>
                                <h2 className='font-bold'>{item.searchInput}</h2>
                                <p className='text-xs text-gray-500'>{moment(item.created_at).fromNow()}</p>
                            </div>
                            <SquareArrowUpRight/>
                        </div>
                        <hr className='my-4' />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Library