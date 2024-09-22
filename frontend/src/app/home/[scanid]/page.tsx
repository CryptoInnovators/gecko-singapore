"use client";

import React, { useEffect, useState, useRef } from 'react';
import useUser from '../../hook/useUser';
import { getScan, getFile } from '../../../utils/scanUtils';
import CodeRenderer from '../../../components/CodeRenderer/CodeRenderer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { AlertCircle } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';

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
  const [progress, setProgress] = useState(0);
  const [coveredLines, setCoveredLines] = useState<number[]>([]);
  const [visibleVulnerabilities, setVisibleVulnerabilities] = useState(0);
  const [instructionCoverageData, setInstructionCoverageData] = useState<Array<{ time: number; coverage: number }>>([]);
  const [branchCoverageData, setBranchCoverageData] = useState<Array<{ time: number; coverage: number }>>([]);
  const [highestCoverage, setHighestCoverage] = useState(0);
  const [staticIssues, setStaticIssues] = useState(0);
  const [dynamicIssues, setDynamicIssues] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (scan) {
      const lastUpdated = new Date(scan.uploaded_at);
      const now = new Date();
      const secondsSinceUpdate = differenceInSeconds(now, lastUpdated) - 8 * 60 * 60;

      if (secondsSinceUpdate <= 300) { // within 5 minutes
        const remainingSeconds = 300 - secondsSinceUpdate;
        const progressIncrement = 100 / (remainingSeconds / 2);

        intervalRef.current = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = Math.min(prevProgress + progressIncrement, 100);
            updateUIElements(newProgress);
            return newProgress;
          });
        }, 2000);

        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      } else {
        setProgress(100);
        updateUIElements(100);
      }
    }
  }, [scan]);

  if (userLoading || isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error loading user data.</div>;
  if (!scan) return <div className="text-white">No scan found</div>;

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
                <div>
                  <h1 className="text-xl font-bold text-white">{scan.name}</h1>
                  <p className="text-sm text-gray-400">
                    Last updated: {format(new Date(scan.uploaded_at), 'MM/dd/yyyy, h:mm:ss a')}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${progress < duration ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'}`}>
                {progress < duration ? 'Scanning...' : 'Completed'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mt-4">
            <div>
                <p className="text-gray-400">Issues found</p>
                <p className="font-semibold text-white">{visibleVulnerabilities}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-semibold text-white">{Math.floor(progress * 0.9)}s</p>
              </div>
              <div>
                <p className="text-gray-400">Code Coverage</p>
                <p className="font-semibold text-white">
                  {highestCoverage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/50 border-gray-800 mb-2">
          <CardHeader>
            <CardTitle className="text-white">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Dynamic Analysis ({dynamicIssues})</button>
                <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Static Analysis ({staticIssues})</button>
              </div>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {vulnerabilities.slice(0, visibleVulnerabilities).map((vuln, index) => (
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
                <ResponsiveContainer width="100%" height={200} className='pr-4'>
                  <LineChart data={instructionCoverageData} margin={{ left: -30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: 'white' }} />
                    <Line type="monotone" dataKey="coverage" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-white">Branch Coverage</h3>
                <ResponsiveContainer width="100%" height={200} className='pr-4'>
                  <LineChart data={branchCoverageData} margin={{ left: -30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: 'white' }} />
                    <Line type="monotone" dataKey="coverage" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;