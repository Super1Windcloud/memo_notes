"use client";

import { format, formatDistanceToNow } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
	BookmarkCheck,
	Filter,
	Flame,
	LayoutList,
	Pin,
	Search,
	Sparkles,
	Tag,
	Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MemoCategory = "note" | "idea" | "task" | "journal";

type Memo = {
	id: string;
	content: string;
	tags: string[];
	category: MemoCategory;
	pinned: boolean;
	createdAt: string;
};

type FilterValue = "all" | "pinned" | "tasks" | "ideas" | "journal" | "notes";

const STORAGE_KEY = "memos-demo";

const demoMemos: Memo[] = [
	{
		id: "1",
		content:
			"Ship v1.4 today. Keep the release note tight and highlight the frictionless capture flow.",
		tags: ["product", "release"],
		category: "task",
		pinned: true,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
	},
	{
		id: "2",
		content:
			"Memo inbox should accept inline #tags and auto-link. Keeps focus on writing while staying organized.",
		tags: ["idea", "ux"],
		category: "idea",
		pinned: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
	},
	{
		id: "3",
		content:
			"Retro: small wins stack fast. Pair programming sessions felt lighter when we started with a tiny note first.",
		tags: ["journal", "team"],
		category: "journal",
		pinned: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
	},
	{
		id: "4",
		content:
			"Checklist: tighten meeting agendas, leave one takeaway memo, and send async summary before EOD.",
		tags: ["note", "execution"],
		category: "note",
		pinned: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(),
	},
];

const filterOptions: {
	value: FilterValue;
	label: string;
	description: string;
	icon: LucideIcon;
}[] = [
	{
		value: "all",
		label: "All memos",
		description: "Every memo you captured",
		icon: LayoutList,
	},
	{
		value: "pinned",
		label: "Pinned",
		description: "Quick access to anchors",
		icon: Pin,
	},
	{
		value: "tasks",
		label: "Tasks",
		description: "Actionable items and checklists",
		icon: BookmarkCheck,
	},
	{
		value: "ideas",
		label: "Ideas",
		description: "Sparks worth exploring",
		icon: Sparkles,
	},
	{
		value: "journal",
		label: "Journal",
		description: "Daily reflections",
		icon: Flame,
	},
	{
		value: "notes",
		label: "Notes",
		description: "Plain notes without ceremony",
		icon: Tag,
	},
];

const categoryAccent: Record<MemoCategory, string> = {
	note: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
	idea: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
	task: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
	journal: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
};

export default function Home() {
	const [memos, setMemos] = useState<Memo[]>(demoMemos);
	const [content, setContent] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [category, setCategory] = useState<MemoCategory>("note");
	const [pinned, setPinned] = useState(false);
	const [filter, setFilter] = useState<FilterValue>("all");
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		if (saved) {
			setMemos(JSON.parse(saved));
		}
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (hydrated) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
		}
	}, [memos, hydrated]);

	const tagUsage = useMemo(() => {
		const counter = new Map<string, number>();
		for (const memo of memos) {
			for (const tag of memo.tags) {
				counter.set(tag, (counter.get(tag) ?? 0) + 1);
			}
		}
		return Array.from(counter.entries()).sort((a, b) => b[1] - a[1]);
	}, [memos]);

	const stats = useMemo(
		() => ({
			total: memos.length,
			pinned: memos.filter((memo) => memo.pinned).length,
			tasks: memos.filter((memo) => memo.category === "task").length,
		}),
		[memos],
	);

	const filteredMemos = useMemo(() => {
		const query = search.trim().toLowerCase();
		return [...memos]
			.filter((memo) => {
				if (filter === "pinned" && !memo.pinned) return false;
				if (filter === "tasks" && memo.category !== "task") return false;
				if (filter === "ideas" && memo.category !== "idea") return false;
				if (filter === "journal" && memo.category !== "journal") return false;
				if (filter === "notes" && memo.category !== "note") return false;
				if (activeTag && !memo.tags.includes(activeTag)) return false;
				if (!query) return true;
				const inContent = memo.content.toLowerCase().includes(query);
				const inTags = memo.tags.some((tag) =>
					tag.toLowerCase().includes(query),
				);
				return inContent || inTags;
			})
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
	}, [memos, filter, search, activeTag]);

	const handleSave = () => {
		if (!content.trim()) return;
		const normalizedTags = tagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
		const nextMemo: Memo = {
			id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
			content: content.trim(),
			tags: normalizedTags,
			category,
			pinned,
			createdAt: new Date().toISOString(),
		};

		setMemos((prev) => [nextMemo, ...prev]);
		setContent("");
		setTagsInput("");
		setPinned(false);
		setCategory("note");
	};

	const handleTemplate = (template: Partial<Memo>) => {
		setContent(template.content ?? "");
		setTagsInput(template.tags?.join(", ") ?? "");
		setCategory(template.category ?? "note");
		setPinned(Boolean(template.pinned));
	};

	const resetDemo = () => {
		setMemos(demoMemos);
		setContent("");
		setTagsInput("");
		setPinned(false);
		setCategory("note");
		setFilter("all");
		setActiveTag(null);
		setSearch("");
	};

	return (
		<div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-black">
			<div className="pointer-events-none absolute inset-x-4 top-8 mx-auto h-40 max-w-5xl rounded-3xl bg-gradient-to-r from-indigo-500/15 via-sky-500/10 to-emerald-400/10 blur-3xl dark:from-indigo-500/20 dark:via-sky-500/15 dark:to-emerald-400/20" />

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<header className="flex flex-col gap-3">
					<div className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 backdrop-blur dark:bg-white/5 dark:text-indigo-100 dark:ring-white/10">
						<Sparkles className="h-4 w-4" />
						Live memo board
					</div>
					<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div className="space-y-2">
							<h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
								Memos, but streamlined
							</h1>
							<p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
								Capture small thoughts, tag them instantly, and keep a tidy
								stream of memos without breaking flow.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								className="gap-2"
								type="button"
								onClick={resetDemo}
							>
								<LayoutList className="h-4 w-4" />
								Reset to demo
							</Button>
							<Button
								className="gap-2"
								variant="default"
								type="button"
								onClick={() =>
									handleTemplate({
										content: "Quick note: sketch the onboarding checklist.",
										tags: ["note", "capture"],
										category: "note",
										pinned: false,
									})
								}
							>
								<Wand2 className="h-4 w-4" />
								Drop a quick memo
							</Button>
						</div>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[320px,1fr]">
					<aside className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Pulse</CardTitle>
								<CardDescription>
									A lightweight snapshot of your memo flow.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										All memos
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.total}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										stored locally
									</p>
								</div>
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										Pinned
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.pinned}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										anchors
									</p>
								</div>
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										Tasks
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.tasks}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										waiting
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">Filters</CardTitle>
								<CardDescription>
									Use one tap filters to slice your stream.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
									<Input
										placeholder="Search memos or #tags"
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										className="pl-9"
									/>
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									{filterOptions.map((option) => {
										const active = filter === option.value;
										return (
											<button
												key={option.value}
												type="button"
												onClick={() => setFilter(option.value)}
												className={cn(
													"group flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10",
													active
														? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10"
														: "border-slate-200/70 bg-white/80 dark:bg-white/5",
												)}
											>
												<span
													className={cn(
														"mt-0.5 rounded-full p-2 text-slate-600 transition dark:text-slate-100",
														active
															? "bg-indigo-500 text-white shadow-sm dark:bg-indigo-500"
															: "bg-slate-100 dark:bg-white/5",
													)}
												>
													<option.icon className="h-4 w-4" />
												</span>
												<span className="space-y-1">
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{option.label}
													</p>
													<p className="text-xs text-slate-500 transition group-hover:text-slate-600 dark:text-slate-300">
														{option.description}
													</p>
												</span>
											</button>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">Tags</CardTitle>
								<CardDescription>
									Pick one tag to narrow the list. Tap again to clear.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								{tagUsage.length === 0 ? (
									<p className="text-sm text-slate-500 dark:text-slate-300">
										No tags yet. Add some while saving.
									</p>
								) : (
									tagUsage.map(([tag, count]) => (
										<button
											key={tag}
											type="button"
											onClick={() =>
												setActiveTag((current) =>
													current === tag ? null : tag,
												)
											}
											className={cn(
												"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10",
												activeTag === tag
													? "bg-indigo-600 text-white shadow"
													: "bg-white/70 text-slate-700 dark:bg-white/5 dark:text-white",
											)}
										>
											<Tag className="h-4 w-4" />
											<span>{tag}</span>
											<span className="text-xs opacity-70">{count}</span>
										</button>
									))
								)}
							</CardContent>
						</Card>
					</aside>

					<section className="space-y-5">
						<Card className="border-0 bg-white/80 shadow-lg ring-1 ring-slate-200 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<CardTitle>Quick capture</CardTitle>
										<CardDescription>
											Type, tag, and drop a memo without leaving the keyboard.
										</CardDescription>
									</div>
									<div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex dark:text-slate-300">
										<Filter className="h-4 w-4" />
										Autosaves to your browser
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<Textarea
									placeholder="Write a thought, link, or checklist..."
									value={content}
									onChange={(event) => setContent(event.target.value)}
									rows={4}
									className="resize-none bg-white/90 text-base dark:bg-white/5"
								/>
								<div className="grid gap-3 md:grid-cols-3">
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											Category
										</p>
										<div className="flex flex-wrap gap-2">
											{(Object.keys(categoryAccent) as MemoCategory[]).map(
												(type) => (
													<Button
														key={type}
														type="button"
														size="sm"
														variant={category === type ? "default" : "outline"}
														className="capitalize"
														onClick={() => setCategory(type)}
													>
														{type}
													</Button>
												),
											)}
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											Tags
										</p>
										<Input
											placeholder="product, focus, idea"
											value={tagsInput}
											onChange={(event) => setTagsInput(event.target.value)}
										/>
									</div>
									<div className="flex items-center justify-between rounded-xl border bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
										<div>
											<p className="text-sm font-medium text-slate-800 dark:text-white">
												Pin on top
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-300">
												Keep this memo in view
											</p>
										</div>
										<Switch
											checked={pinned}
											onCheckedChange={setPinned}
											className="data-[state=checked]:bg-indigo-600"
										/>
									</div>
								</div>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="flex flex-wrap gap-2">
										<Button
											type="button"
											variant="secondary"
											className="gap-2"
											onClick={() =>
												handleTemplate({
													content:
														"Today I learned: small commits keep me shipping.",
													tags: ["journal", "learning"],
													category: "journal",
													pinned: false,
												})
											}
										>
											<Flame className="h-4 w-4" />
											Journal seed
										</Button>
										<Button
											type="button"
											variant="secondary"
											className="gap-2"
											onClick={() =>
												handleTemplate({
													content:
														"Task: close the feedback loop for the next memo drop.",
													tags: ["task", "follow-up"],
													category: "task",
													pinned: true,
												})
											}
										>
											<Pin className="h-4 w-4" />
											Pin a task
										</Button>
									</div>
									<Button
										type="button"
										className="gap-2"
										disabled={!content.trim()}
										onClick={handleSave}
									>
										<Sparkles className="h-4 w-4" />
										Save memo
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<CardTitle className="flex items-center gap-2">
											<LayoutList className="h-5 w-5 text-indigo-500" />
											Live stream
										</CardTitle>
										<CardDescription>
											Filtered memos show up instantly with tags and meta.
										</CardDescription>
									</div>
									<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
										<Tag className="h-4 w-4" />
										{activeTag ?? "Any tag"}
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{filteredMemos.length === 0 ? (
									<div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/60 px-4 py-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
										<Sparkles className="h-5 w-5" />
										<p>No memos match this view. Add one or clear filters.</p>
									</div>
								) : (
									filteredMemos.map((memo) => (
										<div
											key={memo.id}
											className="rounded-2xl border bg-white/80 px-4 py-4 shadow-sm ring-1 ring-slate-200/60 transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:ring-white/5"
										>
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div className="flex items-center gap-2">
													<span
														className={cn(
															"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
															categoryAccent[memo.category],
														)}
													>
														{memo.category}
													</span>
													{memo.pinned ? (
														<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
															<Pin className="h-3 w-3" />
															Pinned
														</span>
													) : null}
												</div>
												<div className="text-xs text-slate-500 dark:text-slate-300">
													{formatDistanceToNow(new Date(memo.createdAt), {
														addSuffix: true,
													})}
												</div>
											</div>
											<p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-100">
												{memo.content}
											</p>
											<div className="mt-3 flex flex-wrap items-center gap-2">
												{memo.tags.length === 0 ? (
													<Badge variant="outline" className="text-xs">
														No tags
													</Badge>
												) : (
													memo.tags.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="flex items-center gap-1 text-xs capitalize"
														>
															<Tag className="h-3 w-3" />
															{tag}
														</Badge>
													))
												)}
											</div>
											<Separator className="my-3" />
											<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
												<div className="flex items-center gap-2">
													<BookmarkCheck className="h-4 w-4" />
													{memo.category === "task" ? "Actionable" : "Noted"}
												</div>
												<span className="font-medium text-slate-700 dark:text-slate-200">
													{format(new Date(memo.createdAt), "MMM d, HH:mm")}
												</span>
											</div>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</div>
	);
}
