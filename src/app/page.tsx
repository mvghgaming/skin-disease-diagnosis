import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Hệ Thống Chẩn Đoán Bệnh Da
          </h1>
          <p className="text-xl text-muted-foreground">
            Chẩn đoán dựa trên hệ thống luật chuyên gia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/diagnosis"
            className="group block p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
              Chẩn đoán →
            </h2>
            <p className="text-muted-foreground">
              Nhập triệu chứng để nhận chẩn đoán sơ bộ và đề xuất điều trị
            </p>
          </Link>

          <Link
            href="/admin"
            className="group block p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
              Quản lý luật →
            </h2>
            <p className="text-muted-foreground">
              Giao diện quản lý và cập nhật các luật chẩn đoán
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Về hệ thống</h3>
          <p className="text-sm text-muted-foreground">
            Hệ thống chuyên gia sử dụng suy diễn tiến để chẩn đoán bệnh dựa trên triệu chứng.
            Hiện hỗ trợ chẩn đoán 7 bệnh da với 99 luật lâm sàng: Chốc, Nhọt, Viêm nang lông, Trứng cá, Lao da, SSSS và Bệnh phong.
          </p>
        </div>
      </div>
    </main>
  );
}
