import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Download, Search, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Resource {
  id: string;
  name: string;
  type: string;
  file_path: string;
  subject: string | null;
}

const SEMESTER_SUBJECTS: Record<number, string[]> = {
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

const Notes = () => {
  const { semesterId } = useParams();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentSemester = parseInt(semesterId || '0');
  const subjects = SEMESTER_SUBJECTS[currentSemester] || [];

  useEffect(() => {
    fetchNotes();
  }, [semesterId]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('semester', parseInt(semesterId || '0'))
        .eq('type', 'notes')
        .is('year', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(resource.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${resource.name}...`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={`/semester/${semesterId}`}>
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Semester
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
            Semester {semesterId} - Notes
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Available study notes and reference materials
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No notes found
            </h3>
            <p className="text-muted-foreground">
              No notes have been uploaded for Semester {semesterId} yet.
            </p>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {subjects.map((subject) => {
              const subjectNotes = notes.filter(
                (note) =>
                  note.subject === subject &&
                  (searchQuery === "" ||
                    note.name.toLowerCase().includes(searchQuery.toLowerCase()))
              );

              if (subjectNotes.length === 0 && searchQuery !== "") return null;

              return (
                <AccordionItem
                  key={subject}
                  value={subject}
                  className="border rounded-lg bg-card"
                >
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                        <Folder className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-foreground">
                          {subject}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {subjectNotes.length} {subjectNotes.length === 1 ? 'file' : 'files'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    {subjectNotes.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No notes uploaded yet
                      </p>
                    ) : (
                      <div className="space-y-3 mt-3">
                        {subjectNotes.map((note) => (
                          <Card
                            key={note.id}
                            className="p-4 hover:shadow-md transition-all duration-300 bg-background/50"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="font-medium text-foreground truncate">
                                  {note.name}
                                </span>
                              </div>
                              <Button
                                onClick={() => handleDownload(note)}
                                size="sm"
                                className="bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity flex-shrink-0"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default Notes;
