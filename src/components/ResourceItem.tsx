import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export type Resource = {
  id: string;
  name: string;
  type: string;
  file_path: string;
};

type Props = {
  resource: Resource;
  onDownload: (r: Resource) => void;
};

const ResourceItem: React.FC<Props> = ({ resource, onDownload }) => {
  return (
    <Card key={resource.id} className="p-4 sm:p-6 hover:shadow-elevated transition-all duration-300 bg-card border-border">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent flex-shrink-0">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">{resource.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 capitalize">{resource.type.replace("_", " ")}</p>
          <Button onClick={() => onDownload(resource)} className="w-full sm:w-auto bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceItem;
