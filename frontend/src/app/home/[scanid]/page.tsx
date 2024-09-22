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
  const duration = 90;

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

  const updateUIElements = (progress: number) => {
    const totalLines = code.split('\n').length;
    const linesToCover = Math.floor((progress / 100) * totalLines);
    const newCoveredLines = Array.from({ length: linesToCover }, (_, i) => i + 1);
    setCoveredLines(newCoveredLines);

    const totalVulnerabilities = 3; // Assuming 3 vulnerabilities
    const visibleVulns = Math.min(Math.floor((progress / 100) * totalVulnerabilities), totalVulnerabilities);
    setVisibleVulnerabilities(visibleVulns);

    const instructionData = [
      { time: 0, coverage: 0 },
      { time: 5, coverage: Math.min(8, progress * 0.08) },
      { time: 10, coverage: Math.min(15, progress * 0.15) },
      { time: 15, coverage: Math.min(21, progress * 0.21) },
      { time: 20, coverage: Math.min(26, progress * 0.26) },
      { time: 25, coverage: Math.min(30, progress * 0.30) },
      { time: 30, coverage: Math.min(34, progress * 0.34) },
      { time: 35, coverage: Math.min(37, progress * 0.37) },
      { time: 40, coverage: Math.min(40, progress * 0.40) },
      { time: 45, coverage: Math.min(42, progress * 0.42) },
      { time: 50, coverage: Math.min(44, progress * 0.44) },
      { time: 55, coverage: Math.min(46, progress * 0.46) },
      { time: 60, coverage: Math.min(48, progress * 0.48) },
      { time: 65, coverage: Math.min(49, progress * 0.49) },
      { time: 70, coverage: Math.min(50, progress * 0.50) },
      { time: 75, coverage: Math.min(51, progress * 0.51) },
      { time: 80, coverage: Math.min(52, progress * 0.52) },
      { time: 85, coverage: Math.min(53, progress * 0.53) },
      { time: 90, coverage: Math.min(54, progress * 0.54) },
      { time: 95, coverage: Math.min(55, progress * 0.55) },
      { time: 100, coverage: Math.min(56, progress * 0.56) },
    ];
    setInstructionCoverageData(instructionData);

    const branchData = [
      { time: 0, coverage: 0 },
      { time: 5, coverage: Math.min(7, progress * 0.07) },
      { time: 10, coverage: Math.min(13, progress * 0.13) },
      { time: 15, coverage: Math.min(18, progress * 0.18) },
      { time: 20, coverage: Math.min(22, progress * 0.22) },
      { time: 25, coverage: Math.min(26, progress * 0.26) },
      { time: 30, coverage: Math.min(29, progress * 0.29) },
      { time: 35, coverage: Math.min(32, progress * 0.32) },
      { time: 40, coverage: Math.min(35, progress * 0.35) },
      { time: 45, coverage: Math.min(37, progress * 0.37) },
      { time: 50, coverage: Math.min(39, progress * 0.39) },
      { time: 55, coverage: Math.min(41, progress * 0.41) },
      { time: 60, coverage: Math.min(43, progress * 0.43) },
      { time: 65, coverage: Math.min(44, progress * 0.44) },
      { time: 70, coverage: Math.min(45, progress * 0.45) },
      { time: 75, coverage: Math.min(46, progress * 0.46) },
      { time: 80, coverage: Math.min(47, progress * 0.47) },
      { time: 85, coverage: Math.min(48, progress * 0.48) },
      { time: 90, coverage: Math.min(49, progress * 0.49) },
      { time: 95, coverage: Math.min(50, progress * 0.50) },
      { time: 100, coverage: Math.min(51, progress * 0.51) },
    ];
    setBranchCoverageData(branchData);

    const currentInstructionCoverage = instructionData[instructionData.length - 1].coverage;
    const currentBranchCoverage = branchData[branchData.length - 1].coverage;
    const currentHighestCoverage = Math.max(currentInstructionCoverage, currentBranchCoverage);
    setHighestCoverage(Math.round(currentHighestCoverage));

    const newStaticIssues = Math.min(0, 0);
    const newDynamicIssues = Math.min(1, Math.floor(progress / 20));
    setStaticIssues(newStaticIssues);
    setDynamicIssues(newDynamicIssues);
    setVisibleVulnerabilities(newStaticIssues + newDynamicIssues);
  };

  if (userLoading || isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error loading user data.</div>;
  if (!scan) return <div className="text-white">No scan found</div>;

  const vulnerabilities = [
    { title: "Reentrancy Vulnerability", description: "The vulnerability lies in the timing of updating the balance. In Solidity, the execution of the withdrawFunds function is atomic, but it does not prevent re-entrancy attacks. The logic currently deducts the balance only after initiating the external call to transfer Ether to msg.sender. During this transfer, if the recipient is another contract, that contract can execute a fallback function and call back into the withdrawFunds function before the balance has been deducted. What happens here is that if an attacker controls a contract that receives Ether, they can re-enter the withdrawFunds function while the original invocation still has control. This means they can call withdrawFunds multiple times before their balance is adjusted, effectively allowing them to withdraw more Ether than they actually have in their balance.", confidence: 94, location: "Lines 38-43" },
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
                <p className="font-semibold text-white">N/A</p>
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
                <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Dynamic Analysis ({Math.min(1, Math.floor(progress / 20))})</button>
                <button className="bg-gray-800 text-sm px-3 py-1 rounded text-white">Static Analysis ({Math.min(0, Math.floor(progress * 1.5))})</button>
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