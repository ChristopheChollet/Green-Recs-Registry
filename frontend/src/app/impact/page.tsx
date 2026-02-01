"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { GREEN_RECS_REGISTRY_ADDRESS } from "@/constants/addresses";
import { GREEN_RECS_REGISTRY_ABI } from "@/constants/abi";

type ActivityItem = {
  type: "Issued" | "Retired";
  id: string;
  amount: number;
  by: string;
  block: number;
};

export default function ImpactPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [hasWallet, setHasWallet] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "issued" | "retired">("all");

  const loadEvents = useCallback(async () => {
    setStatus("loading");
    setError(null);

    if (!window.ethereum) {
      setHasWallet(false);
      setStatus("idle");
      return;
    }
    setHasWallet(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    setChainId(Number(network.chainId));

    if (Number(network.chainId) !== 31337) {
      setError("Reseau invalide. Passe sur Hardhat Local (31337).");
      setStatus("error");
      return;
    }

    const contract = new ethers.Contract(
      GREEN_RECS_REGISTRY_ADDRESS,
      GREEN_RECS_REGISTRY_ABI,
      provider
    );

    const issued = await contract.queryFilter(contract.filters.Issued(), 0, "latest");
    const retired = await contract.queryFilter(contract.filters.Retired(), 0, "latest");

    const issuedItems = issued.map((event) => {
      const e = event as ethers.EventLog;
      const args = e.args as unknown as { id: bigint; amount: bigint; to: string };
      return {
        type: "Issued" as const,
        id: `REC-${args.id.toString().padStart(3, "0")}`,
        amount: Number(args.amount),
        by: args.to,
        block: e.blockNumber ?? 0,
      };
    });

    const retiredItems = retired.map((event) => {
      const e = event as ethers.EventLog;
      const args = e.args as unknown as {
        id: bigint;
        amount: bigint;
        from: string;
      };
      return {
        type: "Retired" as const,
        id: `REC-${args.id.toString().padStart(3, "0")}`,
        amount: Number(args.amount),
        by: args.from,
        block: e.blockNumber ?? 0,
      };
    });

    const merged = [...issuedItems, ...retiredItems].sort(
      (a, b) => b.block - a.block
    );
    setActivity(merged.slice(0, 10));
    setLastUpdated(new Date().toLocaleTimeString());
    setStatus("idle");
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setHasWallet(false);
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts?.[0] ?? null);
      loadEvents();
    } catch {
      setError("Connexion wallet refusee.");
    }
  }, [loadEvents]);

  useEffect(() => {
    const id = setTimeout(() => {
      loadEvents();
    }, 0);
    return () => clearTimeout(id);
  }, [loadEvents]);

  useEffect(() => {
    const id = setInterval(() => {
      loadEvents();
    }, 10000);

    return () => clearInterval(id);
  }, [loadEvents]);

  const issued = activity
    .filter((a) => a.type === "Issued")
    .reduce((sum, a) => sum + a.amount, 0);

  const retired = activity
    .filter((a) => a.type === "Retired")
    .reduce((sum, a) => sum + a.amount, 0);

  const avoided = Math.round(retired * 0.75);
  const filteredActivity =
    filter === "all"
      ? activity
      : activity.filter((a) =>
          filter === "issued" ? a.type === "Issued" : a.type === "Retired"
        );
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <header className="flex justify-between items-center px-6 py-6 mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold">Impact</h1>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <Link href="/" className="hover:text-white">
            Accueil
          </Link>
          <Link href="/impact" className="hover:text-white">
            Impact
          </Link>
        </nav>
      </header>

      <main className="px-6 pb-16 mx-auto max-w-5xl">
        <p className="text-sm text-zinc-400">
          Cette page resume l&apos;impact climatique des RECs emis et retires.
        </p>
        <div className="flex flex-wrap gap-3 items-center mt-4 text-xs text-zinc-400">
          <button
            type="button"
            onClick={loadEvents}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
          >
            Rafraichir
          </button>
          <button
            type="button"
            onClick={connectWallet}
            className="px-3 py-2 text-xs font-medium text-blue-200 rounded-lg border border-blue-500/60 hover:border-blue-400"
          >
            Connecter wallet
          </button>
          <button
            type="button"
            onClick={() => setActivity([])}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500"
          >
            Vider
          </button>
          {chainId && <span>Reseau: {chainId}</span>}
          {account && (
            <span>
              Compte: {account.slice(0, 6)}…{account.slice(-4)}
            </span>
          )}
          <span>Total: {activity.length}</span>
          {lastUpdated && <span>Maj: {lastUpdated}</span>}
          {status === "loading" && <span>Chargement...</span>}
        </div>
        {!hasWallet && (
          <div className="px-4 py-3 mt-6 text-sm text-amber-200 rounded-xl border border-amber-500/40 bg-amber-500/10">
            Connecte un wallet (MetaMask) pour charger les events on-chain.
          </div>
        )}
        {error && (
          <div className="px-4 py-3 mt-4 text-sm text-red-200 rounded-xl border border-red-500/40 bg-red-500/10">
            {error}
          </div>
        )}

        <div className="grid gap-6 mt-8 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-6">
            <p className="text-sm text-zinc-400">RECs emis</p>
            <p className="mt-2 text-3xl font-semibold">{issued}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-6">
            <p className="text-sm text-zinc-400">RECs retires</p>
            <p className="mt-2 text-3xl font-semibold">{retired}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-6">
            <p className="text-sm text-zinc-400">CO₂ Avoided (t)</p>
            <p className="mt-2 text-3xl font-semibold">{avoided}</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#111827] p-6">
          <h3 className="text-lg font-semibold">Resume du registre</h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>Les tokens ERC‑1155 representent les RECs par type (tokenId).</li>
            <li>Le owner emet des certificats avec une URI fixe.</li>
            <li>Les utilisateurs retirent des certificats avec une raison (audit).</li>
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#111827] p-6">
          <h3 className="text-lg font-semibold">Tendance d&apos;impact</h3>
          <p className="mt-2 text-sm text-zinc-400">
            CO2 evite simule sur les 6 derniers mois.
          </p>

          <svg viewBox="0 0 300 120" className="mt-6 w-full h-28">
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              points="0,90 50,80 100,70 150,55 200,45 250,30 300,20"
            />
            <circle cx="0" cy="90" r="3" fill="#60a5fa" />
            <circle cx="50" cy="80" r="3" fill="#60a5fa" />
            <circle cx="100" cy="70" r="3" fill="#60a5fa" />
            <circle cx="150" cy="55" r="3" fill="#60a5fa" />
            <circle cx="200" cy="45" r="3" fill="#60a5fa" />
            <circle cx="250" cy="30" r="3" fill="#60a5fa" />
            <circle cx="300" cy="20" r="3" fill="#60a5fa" />
          </svg>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-[#111827] p-6">
          <h3 className="text-lg font-semibold">Activite recente</h3>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg border px-3 py-2 ${
                filter === "all"
                  ? "border-blue-400 text-blue-200"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => setFilter("issued")}
              className={`rounded-lg border px-3 py-2 ${
                filter === "issued"
                  ? "border-blue-400 text-blue-200"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              Issued
            </button>
            <button
              type="button"
              onClick={() => setFilter("retired")}
              className={`rounded-lg border px-3 py-2 ${
                filter === "retired"
                  ? "border-blue-400 text-blue-200"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              Retired
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {filteredActivity.map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className="flex justify-between items-center px-4 py-3 rounded-xl border border-zinc-800"
              >
                <div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.type === "Issued"
                          ? "bg-blue-500/20 text-blue-200"
                          : "bg-orange-500/20 text-orange-200"
                      }`}
                    >
                      {item.type === "Issued" ? "Emis" : "Retire"}
                    </span>
                    <p className="font-medium">
                      {item.type === "Issued" ? "Emis" : "Retire"}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {item.id} • by {item.by} • block {item.block}
                  </p>
                </div>
                <p className="font-semibold">{item.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}