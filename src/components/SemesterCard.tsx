import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

interface SemesterCardProps {
  semester: number;
}

export const SemesterCard = ({ semester }: SemesterCardProps) => {
  return (
    <Link to={`/semester/${semester}`} className="block group">
      <Card className="p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-elevated bg-card border-border cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
              Semester {semester}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              View study materials & papers
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
