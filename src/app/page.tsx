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
          <h3 className="font-semibold mb-3">Về hệ thống</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Hệ thống chuyên gia sử dụng suy diễn tiến để chẩn đoán bệnh dựa trên triệu chứng.
            Hiện hỗ trợ chẩn đoán 7 bệnh da với 99 luật lâm sàng.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <span className="px-2 py-1 bg-background rounded">Chốc (Impetigo)</span>
            <span className="px-2 py-1 bg-background rounded">Nhọt (Furuncle)</span>
            <span className="px-2 py-1 bg-background rounded">Viêm nang lông</span>
            <span className="px-2 py-1 bg-background rounded">Trứng cá (Acne)</span>
            <span className="px-2 py-1 bg-background rounded">Lao da</span>
            <span className="px-2 py-1 bg-background rounded">SSSS</span>
            <span className="px-2 py-1 bg-background rounded">Bệnh phong</span>
          </div>
        </div>

        <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold mb-3">Quy trình chẩn đoán</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2">1</div>
              <p>Thông tin bệnh nhân</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2">2</div>
              <p>Triệu chứng</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2">3</div>
              <p>Yếu tố nguy cơ</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2">4</div>
              <p>Xét nghiệm</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-2">5</div>
              <p>Kết quả</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
