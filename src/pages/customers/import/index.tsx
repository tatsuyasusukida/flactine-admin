import Layout from "@/components/layout";
import Link from "next/link";

export default function CustomersImport() {
  return (
    <Layout title="お客さま情報のエクセル入力">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/customers">お客さま情報</Link>
            </li>
            <li className="breadcrumb-item">エクセル入力</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">お客さま情報のエクセル入力</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-outline-secondary" href="/customers">
                &larr; 戻る
              </Link>
            </div>
          </nav>
          <form className="mb-3">
            <div className="mb-3">
              <label htmlFor="file" className="form-label">エクセルファイルを選択</label>
              <input className="form-control" type="file" name="file" id="file" />
            </div>
            <Link className="btn btn-primary" href="/customers/import/finish">入力開始</Link>
          </form>
        </main>
      </div>
    </Layout >
  )
}
