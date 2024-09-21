"use client";

import React, { useEffect, useState } from 'react';
import useUser from '../../hook/useUser';
import { getScan, getFile } from '../../../utils/scanUtils';
import CodeRenderer from '../../../components/CodeRenderer/CodeRenderer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '@nextui-org/spinner';

type Scan = {
  id: string;
  name: string;
  result: any | null;
  uploaded_at: string;
  user_id: string;
  issues_found?: number | 'N/A';
  duration?: number | 'N/A';
  code_coverage?: number | 'N/A';
};

interface PageProps {
  params: {
    scanid: string;
  };
}

const Page = ({ params }: PageProps) => {
  const { scanid } = params;
  const { data: user, isLoading: userLoading, error } = useUser();
  const [scan, setScan] = useState<Scan | null>(null);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScanDetails = async () => {
      if (user && user.id) {
        setIsLoading(true);
        try {
          const scans = await getScan(user.id);
          const selectedScan = scans.find((s: Scan) => s.id === scanid);
          if (selectedScan) {
            setScan(selectedScan);
            const fileContent = await getFile(user.id, scanid);
            setCode(fileContent ?? '');
          }
        } catch (error) {
          console.error('Error fetching scan details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchScanDetails();
  }, [user, scanid]);

  if (userLoading || isLoading) return <div className="text-white">Loading...</div>;
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
    <div className="flex h-screen text-gray-300">
      <div className="w-1/2 overflow-auto p-4 border-gray-800">
        <CodeRenderer code={code} />
      </div>
      <div className="w-1/2 overflow-auto p-4">
        <Card className="bg-accent/50 border-gray-800 mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.4961 16.5166C12.1887 16.6923 11.8113 16.6923 11.5039 16.5166L4.55163 12.5439C4.04076 12.252 3.89112 11.5842 4.22854 11.1022L11.1808 1.17043C11.5789 0.601717 12.4211 0.601718 12.8192 1.17043L19.7715 11.1022C20.1089 11.5842 19.9592 12.252 19.4484 12.5439L12.4961 16.5166ZM13.2404 17.8189L16.4471 15.9865C16.9106 15.7217 17.4109 16.2701 17.1048 16.7074L12.4096 23.4148C12.2105 23.6992 11.7894 23.6992 11.5904 23.4148L6.89511 16.7073C6.58899 16.27 7.08933 15.7216 7.55279 15.9864L10.7597 17.8189C11.5283 18.2581 12.4718 18.2581 13.2404 17.8189Z" fill="currentColor" fillRule="evenodd" />
                </svg>
                <div>
                  <h1 className="text-xl font-bold text-white">{scan.name}</h1>
                  <p className="text-sm text-gray-400">
                    Last updated: {format(new Date(scan.uploaded_at), 'MM/dd/yyyy, h:mm:ss a')}
                  </p>
                </div>
              </div>
              <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Completed</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mt-4">
              <div>
                <p className="text-gray-400">Issues found</p>
                <p className="font-semibold text-white">{scan.issues_found ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-semibold text-white">{scan.duration ? `${scan.duration} min` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Code Coverage</p>
                <p className="font-semibold text-white">
                  {typeof scan.code_coverage === 'number' ? `${scan.code_coverage.toFixed(2)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex mb-4 space-x-2">
          <button
            className={`px-4 py-2 text-sm rounded-full ${activeTab === 'overview' ? 'bg-green-800 text-white' : 'bg-accent/50 text-gray-300'} transition-all duration-200`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-full ${activeTab === 'threatScan' ? 'bg-green-800 text-white' : 'bg-accent/50 text-gray-300'} transition-all duration-200`}
            onClick={() => setActiveTab('threatScan')}
          >
            Threat Scan
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <>
            <Card className="bg-accent/50 border-gray-800 mb-2">
              <CardHeader>
                <CardTitle className="text-white">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="space-x-2">
                    <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Dynamic Analysis (1)</button>
                    <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Static Analysis (124)</button>
                  </div>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {vulnerabilities.map((vuln, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border border-gray-800 rounded">
                      <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-white transition-all duration-200">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="text-red-500" size={20} />
                          <span>{vuln.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3 bg-accent/50">
                        <p className="mb-2">{vuln.description}</p>
                        <p className="mb-1"><strong>Confidence:</strong> <span className="text-yellow-400">{vuln.confidence}%</span></p>
                        <p><strong>Location:</strong> <span className="text-blue-400">{vuln.location}</span></p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          
            <Card className="bg-accent/50 border-gray-800 mb-2">
              <CardHeader>
                <CardTitle className="text-white">Coverage Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-white">Instruction Coverage</h3>
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
                    <h3 className="text-sm font-medium mb-2 text-white">Branch Coverage</h3>
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
          </>
        )}

        {activeTab === 'threatScan' && (
          <Card className="bg-accent/50 border-gray-800 mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Call Graph</CardTitle>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Create alert</button>
            </CardHeader>
            <CardContent>
              <div className="bg-accent h-40 rounded flex items-center justify-center text-white">
                Call Graph Visualization (Placeholder)
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;