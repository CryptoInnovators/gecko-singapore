import useUser from '../app/hook/useUser';
import React, { useEffect, useState } from 'react';
import { Trash2, PlusCircle, FileIcon } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInSeconds } from 'date-fns';
import { getScan, deleteScan } from '../utils/scanUtils';
import UploadButton from './UploadButton';
import Image from 'next/image';

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

export default function Scans() {
  const { data: user, isLoading, error } = useUser();
  const [scans, setScans] = useState<Scan[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scanDuration = 300; // 5 minutes in seconds

  useEffect(() => {
    if (user && user.id) {
      getScan(user.id).then((data) => {
        const updatedScans = data.map((scan: Scan) => ({
          ...scan
        }));
        setScans(updatedScans);
      });
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && user.id) {
      const success = await deleteScan(scanId, user.id);
      if (success) {
        setScans(scans.filter(scan => scan.id !== scanId));
      }
    }
  };

  const isScanning = (uploadedAt: string): boolean => {
    const uploadTime = new Date(uploadedAt);
    const elapsedSeconds = differenceInSeconds(currentTime, uploadTime);
    console.log(elapsedSeconds);
    return elapsedSeconds - (8*60*60) < scanDuration;
  };

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error loading user data.</div>;

  return (
    <div className="text-white">
      <div className="rounded-lg">
        {scans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {scans
              .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
              .map(scan => {
                const scanning = isScanning(scan.uploaded_at);
                return (
                  <Link href={`/home/${scan.id}`} key={scan.id}>
                    <div className="bg-[#171717] rounded-lg p-4 hover:bg-[#1a1a1a] transition-all duration-200 tweet-border h-[160px] flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="text-md font-semibold">{scan.name}</h3>
                            <p className="text-xs text-gray-400">Last updated: {format(new Date(scan.uploaded_at), 'MM/dd/yyyy, h:mm:ss a')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${scanning ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'}`}>
                            {scanning ? 'Scanning...' : 'Completed'}
                          </span>
                          <button 
                            className="text-gray-400 hover:text-red-600 transition-all duration-300" 
                            onClick={(e) => handleDelete(e, scan.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mt-auto">
                        <div>
                          <p className="text-gray-400">Issues found</p>
                          <p className="font-semibold">{scanning ? 'N/A' : (scan.issues_found ?? 'N/A')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duration</p>
                          <p className="font-semibold">N/A</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Code Coverage</p>
                          <p className="font-semibold">
                            {scanning ? 'N/A' : (typeof scan.code_coverage === 'number' ? `${scan.code_coverage.toFixed(2)}%` : 'N/A')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <PlusCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects scanned yet</h3>
              <p className="text-gray-400">Add a new Cairo or Solidity project to get started with your security analysis.</p>
            </div>
            <UploadButton />
          </div>
        )}
      </div>
    </div>
  );
}