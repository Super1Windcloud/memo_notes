"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase-client";

const DRAFT_ROW_ID = "typora-main";
const DEFAULT_DRAFT =
	"## Typora-style draft\n\nWrite in Markdown. Headings, lists, and links stay clean here.";

export default function TyporaLikePage() {
	const router = useRouter();
	const [draft, setDraft] = useState<string>(DEFAULT_DRAFT);
	const [loaded, setLoaded] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchDraft = async () => {
			const { data, error } = await supabase
				.from("drafts")
				.select("content")
				.eq("id", DRAFT_ROW_ID)
				.single();

			if (data?.content) {
				setDraft(data.content);
			}
			if (error && error.code !== "PGRST116") {
				setMessage("从 Supabase 读取草稿失败，已使用默认内容。");
			}
			setLoaded(true);
		};

		fetchDraft().catch(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (!loaded) return;
		const timer = window.setTimeout(() => {
			void supabase.from("drafts").upsert({
				id: DRAFT_ROW_ID,
				content: draft,
				updated_at: new Date().toISOString(),
			});
		}, 400);
		return () => window.clearTimeout(timer);
	}, [draft, loaded]);

	const handleSnapshot = async () => {
		setIsSaving(true);
		setMessage(null);
		const { error } = await supabase.from("drafts").upsert({
			id: DRAFT_ROW_ID,
			content: draft,
			updated_at: new Date().toISOString(),
		});

		if (error) {
			setMessage("保存失败，请稍后重试。");
		} else {
			setMessage("草稿已保存到 Supabase。");
		}
		setIsSaving(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 via-slate-50 to-white px-4 py-10 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-black">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							Typora-style space
						</p>
						<h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
							Focus mode for long-form writing
						</h1>
						<p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
							An uncluttered canvas that mirrors Typora's feel—minimal chrome, roomy line
							height, and Markdown-friendly styling.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/")}
							className="min-w-[88px]"
						>
							Back
						</Button>
						<Button
							type="button"
							className="gap-2 min-w-[120px]"
							disabled={isSaving || !loaded}
							onClick={async (event) => {
								event.preventDefault();
								event.stopPropagation();
								await handleSnapshot();
							}}
						>
							<Save suppressHydrationWarning className="h-4 w-4" />
							{isSaving ? "保存中..." : "保存笔记"}
						</Button>
					</div>
				</div>

				{message ? (
					<div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
						{message}
					</div>
				) : null}

				<Card className="border border-amber-200/60 bg-white/90 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2">
							<FileText
								suppressHydrationWarning
								className="h-5 w-5 text-amber-600 dark:text-amber-300"
							/>
							Typora-like canvas
						</CardTitle>
						<CardDescription>
							Markdown-first surface with gentle contrast for long writing sessions.
						</CardDescription>
					</CardHeader>
					<Separator className="mx-6 dark:bg-white/10" />
					<CardContent className="pt-6">
						<Textarea
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							rows={18}
							className="min-h-[60vh] border-none bg-transparent text-base leading-7 shadow-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 dark:focus-visible:ring-amber-300/50"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
