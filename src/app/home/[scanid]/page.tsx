"use client";

import React, { useEffect, useState } from 'react';
import useUser from '@/app/hook/useUser';
import { getScan, getFile } from '@/utils/scanUtils';
import CodeRenderer from '@/components/CodeRenderer/CodeRenderer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, AlertCircle } from 'lucide-react';

type Scan = {
  id: string;
  name: string;
  result: any | null;
  uploaded_at: string;
  user_id: string;
};

interface PageProps {
  params: {
    scanid: string;
  };
}

const Page = ({ params }: PageProps) => {
  const { scanid } = params;
  const { data: user, isLoading, error } = useUser();
  const [scan, setScan] = useState<Scan | null>(null);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    const fetchScanDetails = async () => {
      if (user && user.id) {
        const scans = await getScan(user.id);
        const selectedScan = scans.find((s: Scan) => s.id === scanid);
        if (selectedScan) {
          setScan(selectedScan);
          const fileContent = await getFile(user.id, scanid);
          setCode(fileContent);
        }
      }
    };

    fetchScanDetails();
  }, [user, scanid]);

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error loading user data.</div>;
  if (!scan) return <div className="text-white">No scan found</div>;

  const coverageData = [
    { time: 0, coverage: 0 },
    { time: 1, coverage: 20 },
    { time: 2, coverage: 40 },
    { time: 3, coverage: 60 },
    { time: 4, coverage: 80 },
    { time: 5, coverage: 100 },
  ];

  const vulnerabilities = [
    { title: "[Fund Loss] Anyone can earn 20,000 ETH by interacting with the provided contracts", description: "A critical vulnerability allowing unauthorized fund withdrawal has been detected.", confidence: 90, location: "Check Exploit for more details." },
    { title: "Reentrancy", description: "A potential reentrancy issue was found in the withdraw function.", confidence: 75, location: "line 105" },
    { title: "Uninitialized Storage Pointer", description: "An uninitialized storage pointer was detected, which could lead to unexpected behavior.", confidence: 85, location: "line 78" },
  ];

  return (
    <div className="flex h-screen bg-black text-gray-300">
      <div className="w-1/2 overflow-auto p-6 border-r border-gray-800">
        <CodeRenderer code={code} />
      </div>
      <div className="w-1/2 overflow-auto p-6">
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">carousel-illustration-01.png</h1>
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Completed</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">ID: 161ee893-17f8-41c5-8fe4-ea5a9c5cf1e8</p>
            <p className="text-sm text-gray-400 mb-1">User: e98a0173-60bc-4118-8e2d-718c1a42618a</p>
            <p className="text-sm text-gray-400 mb-4">Created at: 18/09/2024, 08:30:47</p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Issues found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">125</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">60 <span className="text-xl">min</span></div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Code Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">55.90 <span className="text-xl">%</span></div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white">Execution / Second</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <button className="bg-gray-800 px-3 py-1 rounded text-white">Dynamic Analysis (1)</button>
                <button className="bg-gray-800 px-3 py-1 rounded text-white">Static Analysis (124)</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search issues" className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded" />
              </div>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {vulnerabilities.map((vuln, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-gray-800 rounded">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-800 text-white">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="text-red-500" size={20} />
                      <span>{vuln.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-gray-800">
                    <p className="mb-2">{vuln.description}</p>
                    <p className="mb-1"><strong>Confidence:</strong> <span className="text-yellow-400">{vuln.confidence}%</span></p>
                    <p><strong>Location:</strong> <span className="text-blue-400">{vuln.location}</span></p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Coverage Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Instruction Coverage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={coverageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: 'white' }} />
                    <Line type="monotone" dataKey="coverage" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Branch Coverage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={coverageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: 'white' }} />
                    <Line type="monotone" dataKey="coverage" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Call Graph</CardTitle>
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Create alert</button>
          </CardHeader>
          <CardContent>
            {/* Placeholder for call graph visualization */}
            <div className="bg-gray-800 h-40 rounded flex items-center justify-center text-white">
              Call Graph Visualization (Placeholder)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;