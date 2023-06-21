import Layout from "@/components/layout";
import Link from "next/link";

export default function Messages() {
  return (
    <Layout title="LINEメッセージ">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">LINEメッセージ</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">LINEメッセージ</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-outline-secondary" href="/">
                &larr; 戻る
              </Link>
              <Link
                className="btn btn-outline-primary"
                href="/line-messages.xlsx"
                target="_blank"
              >
                送信履歴ダウンロード
              </Link>
              <Link className="btn btn-outline-primary" href="/messages/send">
                一斉送信
              </Link>
            </div>
          </nav>
        </main>
      </div>
    </Layout>
  );
}
