import Layout from "@/components/layout";
import Link from "next/link";

export default function CustomersImportFinish() {
  return (
    <Layout title="お客さま情報のエクセル入力完了">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/customers">お客さま情報</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/customers/import">エクセル入力</Link>
            </li>
            <li className="breadcrumb-item">完了</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">エクセル入力が完了しました</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-success" href="/customers">
                お客さま情報を表示
              </Link>
            </div>
          </nav>
        </main>
      </div>
    </Layout >
  )
}
