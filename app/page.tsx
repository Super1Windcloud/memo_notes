"use client";

import {
	endOfDay,
	format,
	formatDistanceToNow,
	isWithinInterval,
	startOfDay,
} from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
	BookmarkCheck,
	Calendar as CalendarIcon,
	Copy,
	Edit,
	Filter,
	Flame,
	LayoutList,
	MoreHorizontal,
	Pin,
	Search,
	Sparkles,
	Tag,
	Wand2,
	Palette,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import { type DateRange } from "react-day-picker";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
		createdAt: "2024-05-01T12:00:00.000Z",
	},
	{
		id: "2",
		content:
			"Memo inbox should accept inline #tags and auto-link. Keeps focus on writing while staying organized.",
		tags: ["idea", "ux"],
		category: "idea",
		pinned: false,
		createdAt: "2024-04-30T10:30:00.000Z",
	},
	{
		id: "3",
		content:
			"Retro: small wins stack fast. Pair programming sessions felt lighter when we started with a tiny note first.",
		tags: ["journal", "team"],
		category: "journal",
		pinned: false,
		createdAt: "2024-04-29T08:15:00.000Z",
	},
	{
		id: "4",
		content:
			"Checklist: tighten meeting agendas, leave one takeaway memo, and send async summary before EOD.",
		tags: ["note", "execution"],
		category: "note",
		pinned: false,
		createdAt: "2024-04-28T06:00:00.000Z",
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

type AccentKey = "indigo" | "emerald" | "violet" | "amber" | "rose";

type ThemePreset = {
	label: string;
	swatch: string;
	glow: string;
	glowDark: string;
	pillText: string;
	pillRing: string;
	activeSurface: string;
	activeSurfaceDark: string;
	activeIcon: string;
	strongBg: string;
	heroIcon: string;
	switchClass: string;
	cssVars: CSSProperties;
};

const themePresets: Record<AccentKey, ThemePreset> = {
	indigo: {
		label: "Indigo",
		swatch: "bg-indigo-500",
		glow: "from-indigo-500/15 via-sky-500/10 to-emerald-400/10",
		glowDark: "dark:from-indigo-500/20 dark:via-sky-500/15 dark:to-emerald-400/20",
		pillText: "text-indigo-700 dark:text-indigo-100",
		pillRing: "ring-indigo-200",
		activeSurface: "border-indigo-500 bg-indigo-50/70",
		activeSurfaceDark: "dark:bg-indigo-500/10",
		activeIcon: "bg-indigo-500 text-white shadow-sm dark:bg-indigo-500",
		strongBg: "bg-indigo-600",
		heroIcon: "text-indigo-500",
		switchClass: "data-[state=checked]:bg-indigo-600",
		cssVars: {
			"--primary": "#4f46e5",
			"--primary-foreground": "#f8fafc",
			"--ring": "#6366f1",
		},
	},
	emerald: {
		label: "Emerald",
		swatch: "bg-emerald-500",
		glow: "from-emerald-400/15 via-teal-400/10 to-cyan-300/15",
		glowDark: "dark:from-emerald-400/20 dark:via-teal-400/15 dark:to-cyan-300/20",
		pillText: "text-emerald-700 dark:text-emerald-100",
		pillRing: "ring-emerald-200",
		activeSurface: "border-emerald-500 bg-emerald-50/70",
		activeSurfaceDark: "dark:bg-emerald-500/10",
		activeIcon: "bg-emerald-500 text-white shadow-sm dark:bg-emerald-500",
		strongBg: "bg-emerald-600",
		heroIcon: "text-emerald-500",
		switchClass: "data-[state=checked]:bg-emerald-600",
		cssVars: {
			"--primary": "#059669",
			"--primary-foreground": "#ecfeff",
			"--ring": "#10b981",
		},
	},
	violet: {
		label: "Violet",
		swatch: "bg-violet-500",
		glow: "from-violet-500/15 via-indigo-400/10 to-sky-300/10",
		glowDark: "dark:from-violet-500/20 dark:via-indigo-400/15 dark:to-sky-300/15",
		pillText: "text-violet-700 dark:text-violet-100",
		pillRing: "ring-violet-200",
		activeSurface: "border-violet-500 bg-violet-50/70",
		activeSurfaceDark: "dark:bg-violet-500/10",
		activeIcon: "bg-violet-500 text-white shadow-sm dark:bg-violet-500",
		strongBg: "bg-violet-600",
		heroIcon: "text-violet-500",
		switchClass: "data-[state=checked]:bg-violet-600",
		cssVars: {
			"--primary": "#7c3aed",
			"--primary-foreground": "#f5f3ff",
			"--ring": "#8b5cf6",
		},
	},
	amber: {
		label: "Amber",
		swatch: "bg-amber-500",
		glow: "from-amber-400/20 via-orange-300/15 to-rose-300/10",
		glowDark: "dark:from-amber-400/20 dark:via-orange-300/15 dark:to-rose-300/15",
		pillText: "text-amber-800 dark:text-amber-100",
		pillRing: "ring-amber-200",
		activeSurface: "border-amber-500 bg-amber-50/80",
		activeSurfaceDark: "dark:bg-amber-500/15",
		activeIcon: "bg-amber-500 text-white shadow-sm dark:bg-amber-500",
		strongBg: "bg-amber-600",
		heroIcon: "text-amber-500",
		switchClass: "data-[state=checked]:bg-amber-600",
		cssVars: {
			"--primary": "#d97706",
			"--primary-foreground": "#fff7ed",
			"--ring": "#f59e0b",
		},
	},
	rose: {
		label: "Rose",
		swatch: "bg-rose-500",
		glow: "from-rose-500/20 via-pink-400/10 to-purple-400/15",
		glowDark: "dark:from-rose-500/20 dark:via-pink-400/15 dark:to-purple-400/20",
		pillText: "text-rose-700 dark:text-rose-100",
		pillRing: "ring-rose-200",
		activeSurface: "border-rose-500 bg-rose-50/80",
		activeSurfaceDark: "dark:bg-rose-500/15",
		activeIcon: "bg-rose-500 text-white shadow-sm dark:bg-rose-500",
		strongBg: "bg-rose-600",
		heroIcon: "text-rose-500",
		switchClass: "data-[state=checked]:bg-rose-600",
		cssVars: {
			"--primary": "#e11d48",
			"--primary-foreground": "#fff1f2",
			"--ring": "#fb7185",
		},
	},
};

type LanguageOption = "en" | "zh";

const preferenceCopy: Record<
	LanguageOption,
	{
		bubble: string;
		headline: string;
		subhead: string;
		preferences: string;
		preferencesHint: string;
		themeLabel: string;
		languageLabel: string;
	}
> = {
	en: {
		bubble: "Live memo board",
		headline: "Memos, but streamlined",
		subhead:
			"Capture small thoughts, tag them instantly, and keep a tidy stream of memos without breaking flow.",
		preferences: "Preferences",
		preferencesHint: "Pick a theme color and language you like.",
		themeLabel: "Theme colors",
		languageLabel: "Language",
	},
	zh: {
		bubble: "实时便签板",
		headline: "轻量化的便签流",
		subhead: "随手记录想法、即时打标签，在流畅的界面里保持节奏。",
		preferences: "偏好设置",
		preferencesHint: "选择喜欢的主题配色和界面语言。",
		themeLabel: "主题配色",
		languageLabel: "语言",
	},
};

const PREFERENCE_KEY = "memos-preferences";

export default function Home() {
	const [memos, setMemos] = useState<Memo[]>(demoMemos);
	const [content, setContent] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [category, setCategory] = useState<MemoCategory>("note");
	const [pinned, setPinned] = useState(false);
	const [filter, setFilter] = useState<FilterValue>("all");
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [hydrated, setHydrated] = useState(false);
	const [accent, setAccent] = useState<AccentKey>("indigo");
	const [language, setLanguage] = useState<LanguageOption>("en");

	useEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		if (saved) {
			setMemos(JSON.parse(saved));
		}
		const savedPreferences = window.localStorage.getItem(PREFERENCE_KEY);
		if (savedPreferences) {
			try {
				const parsed = JSON.parse(savedPreferences) as {
					accent?: AccentKey;
					language?: LanguageOption;
				};
				if (parsed.accent) {
					setAccent(parsed.accent);
				}
				if (parsed.language) {
					setLanguage(parsed.language);
				}
			} catch {
				// no-op if preferences are malformed
			}
		}
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (hydrated) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
		}
	}, [memos, hydrated]);

	useEffect(() => {
		if (hydrated) {
			window.localStorage.setItem(
				PREFERENCE_KEY,
				JSON.stringify({ accent, language }),
			);
		}
	}, [accent, language, hydrated]);

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

	const dateRangeLabel = useMemo(() => {
		if (!dateRange?.from && !dateRange?.to) {
			return "全部时间";
		}
		if (dateRange?.from && dateRange?.to) {
			return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
		}
		if (dateRange?.from) {
			return `自 ${format(dateRange.from, "MMM d")}`;
		}
		return `截至 ${format(dateRange?.to as Date, "MMM d")}`;
	}, [dateRange]);

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
				const withinDateRange = (() => {
					if (!dateRange?.from && !dateRange?.to) return true;
					const createdAt = new Date(memo.createdAt);
					if (dateRange?.from && dateRange?.to) {
						return isWithinInterval(createdAt, {
							start: startOfDay(dateRange.from),
							end: endOfDay(dateRange.to),
						});
					}
					if (dateRange?.from) {
						return createdAt >= startOfDay(dateRange.from);
					}
					return createdAt <= endOfDay(dateRange?.to as Date);
				})();
				if (!withinDateRange) return false;
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
	}, [memos, filter, search, activeTag, dateRange]);

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

	const handleEditMemo = (memo: Memo) => {
		setContent(memo.content);
		setTagsInput(memo.tags.join(", "));
		setCategory(memo.category);
		setPinned(memo.pinned);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleCopy = async (text: string) => {
		if (typeof navigator === "undefined" || !navigator.clipboard) return;
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Swallow copy errors to avoid breaking interactions
		}
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
		setDateRange(undefined);
	};

	const activeTheme = themePresets[accent];
	const localizedCopy = preferenceCopy[language];

	return (
		<div
			className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 pb-16 pt-10 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-black"
			style={activeTheme.cssVars}
		>
			<div
				className={cn(
					"pointer-events-none absolute inset-x-4 top-8 mx-auto h-40 max-w-5xl rounded-3xl bg-gradient-to-r blur-3xl",
					activeTheme.glow,
					activeTheme.glowDark,
				)}
			/>

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<header className="flex flex-col gap-3">
					<div
						className={cn(
							"inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-3 py-1 text-sm font-medium ring-1 backdrop-blur dark:bg-white/5 dark:ring-white/10",
							activeTheme.pillText,
							activeTheme.pillRing,
						)}
					>
						<Sparkles className="h-4 w-4" />
						{localizedCopy.bubble}
					</div>
					<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div className="space-y-2">
							<h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
								{localizedCopy.headline}
							</h1>
							<p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
								{localizedCopy.subhead}
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

				<div className="grid gap-6 lg:grid-cols-[360px,1fr]">
					<aside className="space-y-4">
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">搜索与筛选</CardTitle>
								<CardDescription>
									左侧集中搜索、日历筛选和标签筛选，右侧即刻刷新列表。
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
									<Input
										placeholder="搜索内容或 #标签"
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
														? cn(
																activeTheme.activeSurface,
																activeTheme.activeSurfaceDark,
															)
														: "border-slate-200/70 bg-white/80 dark:bg-white/5",
												)}
											>
												<span
													className={cn(
														"mt-0.5 rounded-full p-2 text-slate-600 transition dark:text-slate-100",
														active
															? activeTheme.activeIcon
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
								<CardTitle className="flex items-center gap-2 text-lg">
									<CalendarIcon className="h-4 w-4" />
									日历筛选
								</CardTitle>
								<CardDescription>按时间窗口过滤帖子/笔记。</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between gap-3 rounded-xl border bg-white/70 px-3 py-3 dark:border-white/10 dark:bg-white/5">
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											当前区间
										</p>
										<p className="text-sm font-semibold text-slate-900 dark:text-white">
											{dateRangeLabel}
										</p>
									</div>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="gap-2">
												<CalendarIcon className="h-4 w-4" />
												<span className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-200">
													{dateRange?.from
														? format(dateRange.from, "MM/dd")
														: "选择"}
												</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="range"
												numberOfMonths={1}
												selected={dateRange}
												onSelect={setDateRange}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										size="sm"
										variant="secondary"
										onClick={() =>
											setDateRange({
												from: new Date(),
												to: new Date(),
											})
										}
									>
										今天
									</Button>
									<Button
										type="button"
										size="sm"
										variant="secondary"
										onClick={() =>
											setDateRange({
												from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
												to: new Date(),
											})
										}
									>
										最近7天
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => setDateRange(undefined)}
									>
										清除
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">标签筛选</CardTitle>
								<CardDescription>
									选择一个标签收敛结果，再次点击可清空。
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								{tagUsage.length === 0 ? (
									<p className="text-sm text-slate-500 dark:text-slate-300">
										暂无标签，保存时添加即可。
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
													? cn(activeTheme.strongBg, "text-white shadow")
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

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Pulse</CardTitle>
								<CardDescription>
									轻量级的统计快照，帮助确认筛选后的体量。
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
											className={activeTheme.switchClass}
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
											<LayoutList
												className={cn("h-5 w-5", activeTheme.heroIcon)}
											/>
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
												<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
													<CalendarIcon className="h-4 w-4" />
													<span>
														{formatDistanceToNow(new Date(memo.createdAt), {
															addSuffix: true,
														})}
													</span>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
																aria-label="更多操作"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																className="gap-2"
																onClick={() => handleCopy(memo.content)}
															>
																<Copy className="h-4 w-4" />
																复制内容
															</DropdownMenuItem>
															<DropdownMenuItem
																className="gap-2"
																onClick={() => handleEditMemo(memo)}
															>
																<Edit className="h-4 w-4" />
																编辑到输入区
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
											<div className="mt-3 text-sm leading-relaxed text-slate-800 dark:text-slate-100 [&>*]:mb-3 [&>*:last-child]:mb-0 [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-3 dark:[&_code]:bg-white/10 dark:[&_pre]:bg-white/5">
												<ReactMarkdown remarkPlugins={[remarkGfm]}>
													{memo.content}
												</ReactMarkdown>
											</div>
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
			<div className="fixed bottom-4 left-4 z-30">
				<div className="group relative">
					<button
						type="button"
						aria-label={localizedCopy.preferences}
						className={cn(
							"flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							activeTheme.strongBg,
						)}
					>
						<Palette className="h-5 w-5" />
					</button>
					<div
						className="pointer-events-none absolute bottom-14 left-0 w-[min(320px,calc(100vw-2rem))] translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
						role="region"
						aria-label={localizedCopy.preferences}
					>
						<div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85">
							<div className="flex items-center justify-between gap-2">
								<div>
									<p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">
										{localizedCopy.preferences}
									</p>
									<p className="text-sm text-slate-600 dark:text-slate-300">
										{localizedCopy.preferencesHint}
									</p>
								</div>
								<Badge variant="secondary" className="text-[11px]">
									{language === "en" ? "EN" : "中文"}
								</Badge>
							</div>
							<div className="mt-3 space-y-3">
								<div className="space-y-2">
									<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
										{localizedCopy.themeLabel}
									</p>
									<div className="flex flex-wrap gap-2">
										{(Object.keys(themePresets) as AccentKey[]).map((key) => {
											const preset = themePresets[key];
											const isActive = accent === key;
											return (
												<button
													key={key}
													type="button"
													onClick={() => setAccent(key)}
													className={cn(
														"group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10",
														isActive
															? cn(
																	preset.activeSurface,
																	preset.activeSurfaceDark,
																	"shadow",
																)
															: "border-slate-200/70 bg-white/80 dark:bg-white/5",
													)}
												>
													<span
														className={cn(
															"h-6 w-6 rounded-full shadow-inner",
															preset.swatch,
														)}
													/>
													<span className="text-xs text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200">
														{preset.label}
													</span>
												</button>
											);
										})}
									</div>
								</div>
								<div className="space-y-2">
									<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
										{localizedCopy.languageLabel}
									</p>
									<div className="flex gap-2">
										{(["en", "zh"] as LanguageOption[]).map((option) => (
											<button
												key={option}
												type="button"
												onClick={() => setLanguage(option)}
												className={cn(
													"inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10",
													language === option
														? cn(activeTheme.strongBg, "text-white shadow")
														: "border-slate-200/70 bg-white/80 text-slate-700 dark:bg-white/5 dark:text-slate-200",
												)}
											>
												{option === "en" ? "English" : "中文"}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
