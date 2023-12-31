import Layout from "@/components/layout";
import Link from "next/link";

export default function Home() {
  const user = {
    email: "admin@example.com",
  };

  return (
    <Layout title="">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">トップ</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">トップ</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-grid gap-2">
              <Link className="btn btn-outline-primary" href="/customers">
                お客さま情報
              </Link>
              <Link className="btn btn-outline-primary" href="/messages">
                LINEメッセージ
              </Link>
            </div>
          </nav>
        </main>
      </div>
    </Layout>
  );
}
