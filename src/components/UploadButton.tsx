"use client"

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from './ui/dialog';
import useUser from '@/app/hook/useUser';
import Dropzone from 'react-dropzone';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { v4 as uuidv4 } from "uuid";
import { Input } from './ui/input';
import { PlusCircle, Github, Upload, FileIcon } from 'lucide-react';

const supabase = supabaseBrowser();

const UploadButton = () => {
  const { isFetching, data: user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showContractUpload, setShowContractUpload] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const uploadImage = async (file: File) => {
    // ... (keep your existing upload logic)
  };

  const uploadOptions = [
    { icon: <Github className="h-5 w-5 mr-2" />, label: "Github Application", action: () => console.log("Github clicked") },
    { icon: <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>, label: "Verified Contracts", action: () => console.log("Verified Contracts clicked") },
    { icon: <Upload className="h-5 w-5 mr-2" />, label: "Upload Contract", action: () => setShowContractUpload(true) },
  ];

  const handleStartScan = () => {
    console.log("Starting scan for project:", projectName, "with file:", file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => {
      if (!v) {
        setIsOpen(v);
        setShowContractUpload(false);
        setProjectName('');
        setFile(null);
      }
    }}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </DialogTrigger>

      <DialogContent className={`sm:max-w-[${showContractUpload ? '600px' : '425px'}] bg-background tweet-border`}>
        {!showContractUpload ? (
          <div className="grid gap-4 pt-6">
            {uploadOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left font-normal border-gray-700 hover:bg-gray-800"
                onClick={option.action}
              >
                {option.icon}
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <>
            <DialogTitle className="text-xl font-semibold mb-4">Upload contract</DialogTitle>
            <p className="text-gray-400 mb-4">
              Upload your Cairo files (.cairo extension) as a project and scan to detect vulnerabilities in your project.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <Input
                  id="projectName"
                  placeholder="Enter Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full"
                />
              </div>
              <Dropzone
                onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}
                accept={{
                  'application/octet-stream': ['.cairo']
                }}
                maxFiles={1}
              >
                {({getRootProps, getInputProps}) => (
                  <div {...getRootProps()} className="border-2 border-dashed border-gray-700 rounded-lg p-10 text-center cursor-pointer hover:border-gray-500 transition-colors">
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-red-500 mr-2" />
                        <span className="text-gray-300">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Drag and drop or Browse to upload</p>
                        <p className="text-gray-500 text-sm mt-2">You can upload only 1 file with extension ".cairo" whose size must not exceed above 10 MB</p>
                      </>
                    )}
                  </div>
                )}
              </Dropzone>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">NOTE: Please verify the following to avoid scan failure:</h4>
                  <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    <li>You can only upload a single file using this method.</li>
                    <li>File size should not exceed 5 MB and must have a (.sol) extension.</li>
                  </ul>
                </div>
                <div className="flex-shrink-0 ml-4 relative">
                  <FileIcon className="h-16 w-16 text-gray-700" />
                  <div className="bg-red-700 text-white text-xs font-bold px-1 py-1 rounded absolute top-6 -right-2">
                    .cairo
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-red-400 to-red-800 transition-all duration-300 hover:opacity-70 text-white font-bold py-2 px-4 rounded"
                onClick={handleStartScan}
                disabled={!projectName || !file}
              >
                Start Scan
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UploadButton;