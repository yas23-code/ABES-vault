import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SEMESTER_SUBJECTS: Record<number, string[]> = {
  1:[
    "Fundamentals of linear algebra and statistics",
    "Designing Thinking,Innovation,Entrepreneurship ",
    "DS",
    "Soft-Skills",
    "Basics of Mechanical & Automation Engineering",
    "Basics Electronics Engineering",

  ],
  3: [
    "maths-4",
    "Dstl",
    "Data Structure",
    "COA",
    "Cyber-security",
    "Python",
    "UHVPE",
    "Technical-Communication",
    "Digital-Electronics"
  ],
  4: [
    "Maths-4",
    "Technical-Communication",
    "UHVPE",
    "Python",
    "Cyber-Security",
    "Operating-System",
    "OOPS with Java",
    "Theory of Automate and Formal Languages"
  ],
  5: [
    "DAA",
    "DBMS",
    "Web Technology",
    "Object Oriented System Design",
    "Appliction Of Soft Computing"
  ],
  6: [
    "Software Engneering",
    "Compiler Design",
    "Computer Networks",
    "Big Data"
  ],
  7: [
    "AI",
    "Cloud Computing",
    "Open Elective-ii"
  ]
};

const Upload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [assessment, setAssessment] = useState("");
  const isMtSemester = semester === "1" || semester === "2";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For notes, year is not required but subject is
    if (!semester || !type || !file || (type === "question_paper" && (!year || (isMtSemester && !assessment))) || (type === "notes" && !subject)) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = type === "notes" 
        ? `${semester}/notes/${subject}/${Date.now()}.${fileExt}`
        : isMtSemester
          ? `${semester}/${year}/${assessment}/${type}/${Date.now()}.${fileExt}`
          : `${semester}/${year}/${type}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('resources')
        .insert({
          semester: parseInt(semester),
          year: type === "notes" ? null : parseInt(year),
          type,
          name: file.name,
          file_path: fileName,
          subject: type === "notes" ? subject : null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully!`,
      });

      setSemester("");
      setYear("");
      setType("");
      setSubject("");
      setFile(null);
      
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
            Upload Resources
          </h1>
          <p className="text-muted-foreground text-lg">
            Add question papers and notes for students
          </p>
        </div>

        <Card className="p-8 bg-card border-border shadow-elevated">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type !== "notes" && (
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                      <SelectItem key={yr} value={yr.toString()}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question_paper">Question Paper</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "question_paper" && isMtSemester && (
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment</Label>
                <Select value={assessment} onValueChange={setAssessment}>
                  <SelectTrigger id="assessment">
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {['mt-1','mt-2','mt-3'].map((mt) => (
                      <SelectItem key={mt} value={mt}>
                        {mt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "notes" && semester && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {(SEMESTER_SUBJECTS[parseInt(semester)] || []).map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">PDF File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity text-lg py-6"
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              {uploading ? "Uploading..." : "Upload Resource"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
