import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Download, Search, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  name: string;
  type: string;
  file_path: string;
}

const Year = () => {
  const { semesterId, year } = useParams();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMt, setSelectedMt] = useState<string | null>(null);
  const isMtSemester = semesterId === '1' || semesterId === '2';

  useEffect(() => {
    fetchResources();
  }, [semesterId, year]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('semester', parseInt(semesterId || '0'))
        .eq('year', parseInt(year || '0'))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading resources",
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

  const assessments = ['mt-1', 'mt-2', 'mt-3'];
  const filteredResources = resources
    .filter((resource) => !isMtSemester || !selectedMt || resource.file_path.includes(`/${selectedMt}/`))
    .filter((resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  const shouldShowResources = !isMtSemester || selectedMt !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={`/semester/${semesterId}`}>
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Years
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
            Semester {semesterId} - Year {year}
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Available study materials and question papers
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search PDFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isMtSemester && !selectedMt ? (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {assessments.map((mt) => (
                <button key={mt} onClick={() => setSelectedMt(mt)} className="text-left">
                  <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-elevated bg-card border-border cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary">
                        <Folder className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground">
                          {mt}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Previous year papers
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        ) : isMtSemester && selectedMt ? (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">{selectedMt.toUpperCase()} Papers</h2>
            <Button variant="secondary" onClick={() => setSelectedMt(null)}>Back to assessments</Button>
          </div>
        ) : null}
        
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading resources...
          </div>
        ) : !shouldShowResources ? (
          null
        ) : filteredResources.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No resources found
            </h3>
            <p className="text-muted-foreground">
              {isMtSemester && selectedMt ? `No PDFs in ${selectedMt} for Semester ${semesterId} - Year ${year}.` : `No PDFs have been uploaded for Semester ${semesterId} - Year ${year} yet.`}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="p-4 sm:p-6 hover:shadow-elevated transition-all duration-300 bg-card border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 capitalize">
                      {resource.type.replace("_", " ")}
                    </p>
                    <Button
                      onClick={() => handleDownload(resource)}
                      className="w-full sm:w-auto bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Year;
