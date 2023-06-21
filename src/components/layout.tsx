import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
};

export default function Layout(props: Props) {
  return (
    <>
      <Head>
        <title>
          {props.title +
            (props.title === "" ? "" : "｜") +
            "LINE顧客対応自動化管理システム"}
        </title>
      </Head>
      <header>
        <nav
          className="navbar navbar-expand navbar-light bg-light"
          aria-label="ヘッダー"
        >
          <div className="container-fluid">
            <Link href="/" className="navbar-brand">
              LINE顧客対応自動化管理システム
            </Link>
          </div>
        </nav>
      </header>
      {props.children}
      <footer>
        <div className="border-top">
          <div className="container">
            <div className="pt-3 pb-3">
              <address>&copy; フラワー・アクト</address>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
