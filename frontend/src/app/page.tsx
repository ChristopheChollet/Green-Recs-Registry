"use client";

import Link from "next/link";
import { useState } from "react";
import { GREEN_RECS_REGISTRY_ADDRESS } from "@/constants/addresses";

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied("error");
      setTimeout(() => setCopied(null), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <header className="flex justify-between items-center px-6 py-6 mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold">GreenRecs Registry</h1>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <Link href="/" className="hover:text-white">
            Accueil
          </Link>
          <Link href="/impact" className="hover:text-white">
            Impact
          </Link>
        </nav>
      </header>

      <main className="px-6 py-16 mx-auto max-w-5xl">
        <p className="text-sm text-zinc-400">MVP ERC‑1155 • Registre RECs</p>
        <h2 className="mt-4 text-4xl font-semibold">
          Suivre, emettre et retirer des certificats d&apos;energie verte
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Ce MVP demontre un registre simple de Certificats d&apos;Energie Renouvelable
          (RECs) via des tokens ERC‑1155. Le owner peut emettre des certificats et
          les utilisateurs peuvent les retirer avec une trace d&apos;audit.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            href="/impact"
            className="px-5 py-3 text-sm font-medium bg-blue-600 rounded-xl hover:bg-blue-500"
          >
            Voir l&apos;impact
          </Link>
          <a
            href="https://github.com"
            className="px-5 py-3 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-200 hover:border-zinc-500"
          >
            Repo
          </a>
        </div>

        <div className="mt-12 rounded-2xl border border-zinc-800 bg-[#111827] p-6">
          <h3 className="text-lg font-semibold">Guide rapide (local)</h3>
          <ol className="mt-4 space-y-2 text-sm text-zinc-300">
            <li className="flex flex-wrap gap-3 items-center">
              <span>1) Lancer le node:</span>
              <code className="text-zinc-200">npx hardhat node</code>
              <button
                type="button"
                onClick={() => copyText("npx hardhat node")}
                className="px-2 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Copier
              </button>
            </li>
            <li className="flex flex-wrap gap-3 items-center">
              <span>2) Deployer:</span>
              <code className="text-zinc-200">
                npx hardhat run scripts/deploy.ts --network localhost
              </code>
              <button
                type="button"
                onClick={() =>
                  copyText("npx hardhat run scripts/deploy.ts --network localhost")
                }
                className="px-2 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Copier
              </button>
            </li>
            <li className="flex flex-wrap gap-3 items-center">
              <span>3) Adresse du contrat:</span>
              <code className="text-zinc-200">{GREEN_RECS_REGISTRY_ADDRESS}</code>
              <button
                type="button"
                onClick={() => copyText(GREEN_RECS_REGISTRY_ADDRESS)}
                className="px-2 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Copier
              </button>
            </li>
            <li>
              4) Mettre l&apos;adresse dans{" "}
              <code className="text-zinc-200">frontend/src/constants/addresses.ts</code>
            </li>
            <li>5) Generer des events via la console Hardhat</li>
          </ol>
          {copied && (
            <p className="mt-3 text-xs text-zinc-400">
              {copied === "error" ? "Copie refusee" : "Commande copiee"}
            </p>
          )}
          <p className="mt-4 text-xs text-zinc-400">
            Objectif: voir les events Issued/Retired s&apos;afficher sur la page Impact.
          </p>
        </div>
      </main>
    </div>
  );
}