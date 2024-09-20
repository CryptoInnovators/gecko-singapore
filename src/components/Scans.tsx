import useUser from '@/app/hook/useUser';
import React, { useEffect, useState } from 'react';
import { Ghost, Plus, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getScan, deleteScan } from '@/utils/scanUtils';
import UploadButton from './UploadButton';

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

const EthLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path clipRule="evenodd" d="M12.4961 16.5166C12.1887 16.6923 11.8113 16.6923 11.5039 16.5166L4.55163 12.5439C4.04076 12.252 3.89112 11.5842 4.22854 11.1022L11.1808 1.17043C11.5789 0.601717 12.4211 0.601718 12.8192 1.17043L19.7715 11.1022C20.1089 11.5842 19.9592 12.252 19.4484 12.5439L12.4961 16.5166ZM13.2404 17.8189L16.4471 15.9865C16.9106 15.7217 17.4109 16.2701 17.1048 16.7074L12.4096 23.4148C12.2105 23.6992 11.7894 23.6992 11.5904 23.4148L6.89511 16.7073C6.58899 16.27 7.08933 15.7216 7.55279 15.9864L10.7597 17.8189C11.5283 18.2581 12.4718 18.2581 13.2404 17.8189Z" fill="currentColor" fillRule="evenodd"/>
  </svg>
);

export default function Scans() {
  const { data: user, isLoading, error } = useUser();
  const [scans, setScans] = useState<Scan[]>([]);

  useEffect(() => {
    if (user && user.id) {
      getScan(user.id).then((data) => setScans(data));
    }
  }, [user]);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user data.</div>;

  return (
    <div className="text-white">
      <div className="bg-[#111] rounded-lg">
        {scans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {scans
              .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
              .map(scan => (
                <Link href={`/home/${scan.id}`} key={scan.id}>
                  <div className="bg-[#171717] rounded-lg p-4 hover:bg-[#1a1a1a] transition-all duration-200 tweet-border h-[172px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <EthLogo />
                        <div>
                          <h3 className="text-md font-semibold">{scan.name}</h3>
                          <p className="text-xs text-gray-400">Last updated: {format(new Date(scan.uploaded_at), 'MM/dd/yyyy, h:mm:ss a')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Completed</span>
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
                        <p className="font-semibold">{scan.issues_found ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Duration</p>
                        <p className="font-semibold">{scan.duration ? `${scan.duration} min` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Code Coverage</p>
                        <p className="font-semibold">{typeof scan.code_coverage === 'number' ? `${scan.code_coverage.toFixed(2)}%` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <PlusCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects scanned yet</h3>
              <p className="text-gray-400">Add a new Cairo project to get started with your security analysis.</p>
            </div>
            <UploadButton />
          </div>
        )}
      </div>
    </div>
  );
}