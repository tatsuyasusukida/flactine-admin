import Layout from "@/components/layout";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import { ChangeEventHandler, MouseEventHandler, useState } from "react";

export default function MessagesImport() {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    content: "",
  });

  const [validation, setValidation] = useState({
    ok: null,
    userId: { ok: null, messages: [] },
    content: { ok: null, messages: [] },
  });

  const onChangeForm: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const { name, value } = event.target;
    setForm((form) => ({
      ...form,
      [name]: value,
    }));
  };

  const onSubmit: MouseEventHandler<HTMLButtonElement> = async (event) => {
    try {
      event.preventDefault();

      const validateUrl = "/api/line-messages/send/validate";
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(form),
      };

      const validateResponse = await fetch(validateUrl, fetchOptions);
      const { validation } = await validateResponse.json();

      if (!validation.ok) {
        setValidation(validation);
        return;
      }

      const submitUrl = "/api/line-messages/send/submit";
      const submitResponse = await fetch(submitUrl, fetchOptions);
      const { ok, redirect } = await submitResponse.json();

      if (ok) {
        router.push(redirect);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
                className={classNames("form-control", {
                  "is-invalid": validation.userId.ok === false,
                })}
                onChange={onChangeForm}
                value={form.userId}
              ></textarea>
              {validation.userId.ok === false && (
                <p className="invalid-feedback">
                  {validation.userId.messages.map((message, i) => (
                    <Fragment key={i}>
                      {i >= 1 && <br />}
                      {message}
                    </Fragment>
                  ))}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">
                メッセージ内容を入力
              </label>
              <textarea
                name="content"
                id="content"
                rows={10}
                className={classNames("form-control", {
                  "is-invalid": validation.content.ok === false,
                })}
                onChange={onChangeForm}
                value={form.content}
              ></textarea>
              {validation.content.ok === false && (
                <p className="invalid-feedback">
                  {validation.content.messages.map((message, i) => (
                    <Fragment key={i}>
                      {i >= 1 && <br />}
                      {message}
                    </Fragment>
                  ))}
                </p>
              )}
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              onClick={onSubmit}
            >
              一斉送信
            </button>
          </form>
        </main>
      </div>
    </Layout>
  );
}
