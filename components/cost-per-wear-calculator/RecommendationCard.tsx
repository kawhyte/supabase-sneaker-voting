// components/cost-per-wear-calculator/RecommendationCard.tsx
import { Recommendation } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Tag } from 'lucide-react';

interface Props {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: Props) {
  const { verdict, score, headline, description, actionPrompt, emoji } = recommendation;

  // Dynamic Styling
  const styles = {
    BUY_NOW: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    WAIT_FOR_SALE: {
      border: 'border-sun-500',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      icon: Tag,
      iconColor: 'text-sun-600'
    },
    PASS: {
      border: 'border-red-500',
      bg: 'bg-red-50',
      text: 'text-red-900',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    }
  }[verdict];

  const Icon = styles.icon;

  return (
    <Card className={cn("relative overflow-hidden border-2 shadow-xl p-6 sm:p-8", styles.border, styles.bg)}>
      {/* Score Badge */}
      <div className="absolute top-0 right-0 p-4">
        <div className={cn("flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 bg-white font-bold text-xl shadow-sm", styles.border, styles.text)}>
          <span>{score}</span>
          <span className="text-[10px] uppercase font-normal text-stone-500 -mt-1">Score</span>
        </div>
      </div>

      <div className="flex items-start gap-4 pr-16">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm", styles.iconColor)}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <Badge variant="outline" className={cn("mb-2 font-bold bg-white/50", styles.text, styles.border)}>
            {verdict.replace(/_/g, ' ')}
          </Badge>
          <h2 className={cn("text-3xl font-bold font-heading mb-2", styles.text)}>
            {headline}
          </h2>
          <p className="text-stone-700 text-lg leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {/* Action Prompt (The "Wait for Sale" Logic) */}
      {actionPrompt && (
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-stone-200 flex items-start gap-3">
          <div className="bg-slate-900 text-white p-1.5 rounded-full mt-0.5">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-1">Smart Buy Recommendation</h4>
            <p className="font-medium text-slate-800">
              {actionPrompt}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}