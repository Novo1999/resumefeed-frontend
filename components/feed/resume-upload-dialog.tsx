'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileTextIcon, Loader2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { FormMessage } from '@/components/auth/form-parts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RESUME_ACCEPT, uploadResume, validateResumeFile } from '@/lib/storage/resumes';
import { readApiError } from '@/store/api/errors';
import { useCreateResumeMutation } from '@/store/api/resumeApi';

export function ResumeUploadDialog({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [createResume, { isLoading: isCreating }] = useCreateResumeMutation();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  // Retaining this after an API error lets a user retry creating the post without
  // uploading a second copy of the same PDF.
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);

  const busy = isUploading || isCreating;

  function pick(nextFile: File) {
    const problem = validateResumeFile(nextFile);
    if (problem) {
      toast.error(problem);
      return;
    }
    setFile(nextFile);
    setUploadedPath(null);
    setMessage(undefined);
  }

  function reset() {
    setFile(null);
    setUploadedPath(null);
    setTitle('');
    setMessage(undefined);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage('Choose a PDF to post.');
      return;
    }

    setMessage(undefined);
    let path = uploadedPath;
    try {
      if (!path) {
        setIsUploading(true);
        path = await uploadResume(ownerId, file);
        setUploadedPath(path);
        setIsUploading(false);
      }

      await createResume({
        storagePath: path,
        originalFilename: file.name,
        title: title.trim() || null,
      }).unwrap();

      toast.success('Your resume is now in the feed.');
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(readApiError(error).message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={<Button />}>
        <UploadIcon />
        Post a resume
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>Post your resume</DialogTitle>
          <DialogDescription>
            Upload one PDF for the community to review. It is stored privately and shared through
            time-limited links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <FormMessage>{message}</FormMessage>

          <div className="flex flex-col gap-2">
            <Label htmlFor="resume-file">Resume PDF</Label>
            <input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept={RESUME_ACCEPT}
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                event.target.value = '';
                if (nextFile) pick(nextFile);
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="justify-start"
            >
              <FileTextIcon />
              {file ? file.name : 'Choose PDF'}
            </Button>
            <p className="text-xs text-muted-foreground">PDF only, up to 5 MB.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="resume-title">Title <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="resume-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="e.g. Product designer resume"
              disabled={busy}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={busy || !file}>
              {busy ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
              {isUploading ? 'Uploading…' : isCreating ? 'Posting…' : 'Post resume'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
