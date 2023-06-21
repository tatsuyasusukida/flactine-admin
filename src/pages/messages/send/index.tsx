import Layout from "@/components/layout";
import Link from "next/link";

export default function MessagesImport() {
  return (
    <Layout title="LINEメッセージの一斉送信">
      <div className="container">
        <nav aria-label="パンくずリスト" className="mt-3 mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">トップ</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/messages">LINEメッセージ</Link>
            </li>
            <li className="breadcrumb-item">一斉送信</li>
          </ol>
        </nav>
        <main>
          <h1 className="mb-3">LINEメッセージの一斉送信</h1>
          <nav aria-label="メニュー" className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-outline-secondary" href="/messages">
                &larr; 戻る
              </Link>
            </div>
          </nav>
          <form className="mb-3">
            <div className="mb-3">
              <label htmlFor="userId" className="form-label">
                LINEユーザーIDを入力（複数の場合は改行）
              </label>
              <textarea
                name="userId"
                id="userId"
                rows={5}
                className="form-control"
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">
                メッセージ内容を入力
              </label>
              <textarea
                name="content"
                id="content"
                rows={10}
                className="form-control"
              ></textarea>
            </div>
            {/* <button className="btn btn-primary" type="submit">
              一斉送信
            </button> */}
            <Link className="btn btn-primary" href="/messages/send/finish">
              一斉送信
            </Link>
          </form>
        </main>
      </div>
    </Layout>
  );
}
