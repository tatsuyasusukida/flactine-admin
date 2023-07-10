import Layout from "@/components/layout";
import { CustomersImportValidateResponse } from "@/pages/api/customers/import/validate";
import Link from "next/link";
import { MouseEventHandler, useRef, useState } from "react";

export default function CustomersImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessages, setErrorMessages] = useState<String[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onClick: MouseEventHandler = async (event) => {
    event.preventDefault();

    const files = fileInputRef.current?.files;

    if (!files || files.length < 1) {
      setErrorMessages(["エクセルファイルをお選びください"]);
      return;
    }

    setErrorMessages([]);

    setIsSubmitting(true);

    try {
      const file = files[0];
      const validateResponse = await fetch("/api/customers/import/validate", {
        method: "PUT",
        body: file,
      });

      const validationResult: CustomersImportValidateResponse =
        await validateResponse.json();

      if (!validationResult.ok) {
        setErrorMessages(validationResult.errorMessages);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <label htmlFor="file" className="form-label">
                エクセルファイルを選択
              </label>
              <input
                className="form-control"
                type="file"
                name="file"
                id="file"
                ref={fileInputRef}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              onClick={onClick}
              disabled={isSubmitting}
            >
              入力開始
            </button>
            {errorMessages.length >= 1 && (
              <p className="mt-3 mb-0 alert alert-info">
                <ul className="list-unstyled mb-0">
                  {errorMessages.map((errorMessage, i) => (
                    <li key={i}>{errorMessage}</li>
                  ))}
                </ul>
              </p>
            )}
          </form>
        </main>
      </div>
    </Layout>
  );
}
