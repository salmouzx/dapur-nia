'use client';

import React from 'react';
import { ReportTab } from '@/components/report/ReportTab';

export default function LaporanPage() {
  return <ReportTab lastUpdated={Date.now()} />;
}
