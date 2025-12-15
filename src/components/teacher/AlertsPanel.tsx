// Alerts Panel Component
// Displays alerts for struggling students

import React from 'react';
import { useTeacherQuizAlerts } from '@/hooks/useQuizPerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCard } from './AlertCard';
import { Loader2, Bell, CheckCircle } from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const { data: alerts, isLoading } = useTeacherQuizAlerts();

  // Count unresolved alerts
  const unresolvedCount = alerts?.filter(a => !a.is_resolved).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-eliza-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-eliza-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-eliza-primary" />
            Student Alerts
          </CardTitle>
          {unresolvedCount > 0 && (
            <Badge className="bg-eliza-red text-white">
              {unresolvedCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-eliza-green mx-auto mb-3" />
            <p className="text-sm text-eliza-text-secondary">
              No alerts! All students are doing well.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
