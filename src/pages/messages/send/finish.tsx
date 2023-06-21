import Layout from "@/components/layout";
import Link from "next/link";

export default function MessagesImport() {
  return (
    <Layout title="LINEメッセージの一斉送信完了">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/messages">LINEメッセージ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/messages/send">一斉送信</Link>
            </li>
            <li className="breadcrumb-item">完了</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">一斉送信が完了しました</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-success" href="/messages">
                LINEメッセージを表示
              </Link>
            </div>
          </nav>
        </main>
      </div>
    </Layout>
  );
}
