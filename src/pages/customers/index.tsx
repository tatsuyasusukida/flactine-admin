import Layout from "@/components/layout";
import Link from "next/link";

export default function Customers() {
  return (
    <Layout title="お客さま情報">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">お客さま情報</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">お客さま情報</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-outline-secondary" href="/">
                &larr; 戻る
              </Link>
              <Link
                className="btn btn-outline-primary"
                href="/customers/import"
              >
                エクセル入力
              </Link>
              <Link
                className="btn btn-outline-primary"
                href="/api/customers/export"
                target="_blank"
              >
                エクセル出力
              </Link>
            </div>
          </nav>
        </main>
      </div>
    </Layout>
  );
}
