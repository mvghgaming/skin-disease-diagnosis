'use client';

import { DiagnosisWizard } from '@/components/diagnosis/DiagnosisWizard';

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Chẩn đoán bệnh da
          </h1>
          <p className="text-lg text-muted-foreground">
            Nhập thông tin theo từng bước để nhận chẩn đoán sơ bộ
          </p>
        </div>

        <DiagnosisWizard />
      </div>
    </div>
  );
}
