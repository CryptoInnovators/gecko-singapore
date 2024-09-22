"use client"

import React from 'react'
import useUser from '../hook/useUser';
import UploadButton from '../../components/UploadButton';
import Scans from '../../components/Scans';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Search } from "lucide-react"
import { Spinner } from "@nextui-org/spinner";

export default function Dashboard() {
  const {data:user, isLoading} = useUser();
  
  if(isLoading){
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner color="default"/>
      </div>
    );
  }

  return (
    <main className='mx-auto max-w-7xl px-4 py-6'>
      <Card className=" text-white gap-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Projects</CardTitle>
          <UploadButton />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by Project or Contract" 
                className="pl-8 bg-[#1c1c1c] border-gray-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-[#2c2c2c]">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h18M3 12h18M3 20h18M7 8l-4 4 4 4" />
              </svg>
              Filter
            </Button>
          </div>
          
          {/* Scans component */}
          <Scans />
        </CardContent>
      </Card>
    </main>
  )
}