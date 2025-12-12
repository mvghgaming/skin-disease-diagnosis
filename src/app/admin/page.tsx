'use client';

import { useEffect, useState } from 'react';
import { Rule } from '@/types/rule';
import { Disease } from '@/types/disease';
import { RulesList } from '@/components/admin/RulesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch rules
      const rulesResponse = await fetch('/api/rules');
      if (!rulesResponse.ok) throw new Error('Failed to fetch rules');
      const rulesData = await rulesResponse.json();
      setRules(rulesData.rules || []);

      // Fetch diseases
      const diseasesResponse = await fetch('/api/diseases');
      if (!diseasesResponse.ok) throw new Error('Failed to fetch diseases');
      const diseasesData = await diseasesResponse.json();
      setDiseases(diseasesData.diseases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Knowledge Engineer Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Quản lý quy tắc chẩn đoán
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Trang chủ</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <p className="font-semibold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng số quy tắc</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{rules.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Số bệnh</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{diseases.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quy tắc hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {rules.filter((r) => r.status === 'active').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Diseases */}
            {diseases.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Danh sách bệnh</CardTitle>
                  <CardDescription>
                    Các bệnh có trong hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diseases.map((disease) => (
                      <div
                        key={disease.id}
                        className="flex items-start justify-between p-4 border rounded-md"
                      >
                        <div>
                          <h3 className="font-semibold">{disease.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {disease.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            ID: {disease.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules List */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Danh sách quy tắc</h2>
              <RulesList rules={rules} />
            </div>

            {/* Instructions */}
            {rules.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn seed dữ liệu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Bước 1: Cập nhật DATABASE_URL</h3>
                    <p className="text-sm text-muted-foreground">
                      Mở file <code className="bg-muted px-2 py-1 rounded">.env.local</code> và
                      thay thế DATABASE_URL bằng connection string Neon PostgreSQL của bạn.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bước 2: Chạy migration</h3>
                    <code className="block bg-muted p-3 rounded mt-2">
                      pnpm run migrate
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bước 3: Seed dữ liệu</h3>
                    <code className="block bg-muted p-3 rounded mt-2">
                      pnpm run seed
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bước 4: Tải lại trang</h3>
                    <Button onClick={fetchData} className="mt-2">
                      Tải lại dữ liệu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
