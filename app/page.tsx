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
	icon: LucideIcon;
}[] = [
	{
		value: "all",
		icon: LayoutList,
	},
	{
		value: "pinned",
		icon: Pin,
	},
	{
		value: "tasks",
		icon: BookmarkCheck,
	},
	{
		value: "ideas",
		icon: Sparkles,
	},
	{
		value: "journal",
		icon: Flame,
	},
	{
		value: "notes",
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

type TemplatePreset = Pick<Memo, "content" | "tags" | "category" | "pinned">;

const uiCopy: Record<
	LanguageOption,
	{
		bubble: string;
		headline: string;
		subhead: string;
		preferences: {
			title: string;
			hint: string;
			themeLabel: string;
			languageLabel: string;
			badge: string;
			languageNames: Record<LanguageOption, string>;
		};
		categoryLabels: Record<MemoCategory, string>;
		actions: {
			reset: string;
			quickMemo: {
				label: string;
				template: TemplatePreset;
			};
		};
		search: {
			title: string;
			description: string;
			placeholder: string;
			filterOptions: Record<
				FilterValue,
				{
					label: string;
					description: string;
				}
			>;
		};
		calendar: {
			title: string;
			description: string;
			currentRange: string;
			select: string;
			today: string;
			last7: string;
			clear: string;
		};
		tags: {
			title: string;
			description: string;
			empty: string;
		};
		pulse: {
			title: string;
			description: string;
			totalTitle: string;
			totalHint: string;
			pinnedTitle: string;
			pinnedHint: string;
			tasksTitle: string;
			tasksHint: string;
		};
		composer: {
			title: string;
			description: string;
			autosave: string;
			placeholder: string;
			categoryLabel: string;
			tagsLabel: string;
			tagsPlaceholder: string;
			pinTitle: string;
			pinHint: string;
			save: string;
			journalSeedLabel: string;
			journalSeedTemplate: TemplatePreset;
			taskSeedLabel: string;
			taskSeedTemplate: TemplatePreset;
		};
		memoList: {
			title: string;
			description: string;
			filterLabel: string;
			tagLabel: string;
			dateLabel: string;
			allTagsLabel: string;
			empty: string;
			emptyHint: string;
			noTags: string;
			pinned: string;
			actionable: string;
			noted: string;
			itemsSuffix: string;
		};
		menu: {
			copyContent: string;
			editInline: string;
			editContentPrompt: string;
			editTagsPrompt: string;
			saveInline: string;
			cancelInline: string;
		};
		dateRange: {
			all: string;
			fromPrefix: string;
			untilPrefix: string;
		};
	}
> = {
	en: {
		bubble: "Live memo board",
		headline: "Memos, but streamlined",
		subhead:
			"Capture small thoughts, tag them instantly, and keep a tidy stream of memos without breaking flow.",
		preferences: {
			title: "Preferences",
			hint: "Pick a theme color and language you like.",
			themeLabel: "Theme colors",
			languageLabel: "Language",
			badge: "EN",
			languageNames: {
				en: "English",
				zh: "中文",
			},
		},
		categoryLabels: {
			note: "Note",
			idea: "Idea",
			task: "Task",
			journal: "Journal",
		},
		actions: {
			reset: "Reset to demo",
			quickMemo: {
				label: "Drop a quick memo",
				template: {
					content: "Quick note: sketch the onboarding checklist.",
					tags: ["note", "capture"],
					category: "note",
					pinned: false,
				},
			},
		},
		search: {
			title: "Search & filters",
			description:
				"Search, calendar, and tags on the left; cards update instantly on the right.",
			placeholder: "Search content or #tag",
			filterOptions: {
				all: { label: "All memos", description: "Every memo you captured" },
				pinned: { label: "Pinned", description: "Quick access to anchors" },
				tasks: {
					label: "Tasks",
					description: "Actionable items and checklists",
				},
				ideas: { label: "Ideas", description: "Sparks worth exploring" },
				journal: {
					label: "Journal",
					description: "Daily reflections",
				},
				notes: { label: "Notes", description: "Plain notes without ceremony" },
			},
		},
		calendar: {
			title: "Calendar filter",
			description: "Filter notes by a time window.",
			currentRange: "Current range",
			select: "Select",
			today: "Today",
			last7: "Last 7 days",
			clear: "Clear",
		},
		tags: {
			title: "Tag filter",
			description: "Pick a tag to narrow results; click again to reset.",
			empty: "No tags yet—add one when saving.",
		},
		pulse: {
			title: "Pulse",
			description: "Lightweight snapshot to gauge filtered volume.",
			totalTitle: "All memos",
			totalHint: "stored locally",
			pinnedTitle: "Pinned",
			pinnedHint: "anchors",
			tasksTitle: "Tasks",
			tasksHint: "waiting",
		},
		composer: {
			title: "Quick capture",
			description: "Type, tag, and drop a memo without leaving the keyboard.",
			autosave: "Autosaves to your browser",
			placeholder: "Write a thought, link, or checklist...",
			categoryLabel: "Category",
			tagsLabel: "Tags",
			tagsPlaceholder: "product, focus, idea",
			pinTitle: "Pin on top",
			pinHint: "Keep this memo in view",
			save: "Save memo",
			journalSeedLabel: "Journal seed",
			journalSeedTemplate: {
				content: "Today I learned: small commits keep me shipping.",
				tags: ["journal", "learning"],
				category: "journal",
				pinned: false,
			},
			taskSeedLabel: "Pin a task",
			taskSeedTemplate: {
				content: "Task: close the feedback loop for the next memo drop.",
				tags: ["task", "follow-up"],
				category: "task",
				pinned: true,
			},
		},
		memoList: {
			title: "Memo cards",
			description:
				"Left-side search and filters apply instantly; cards on the right refresh live.",
			filterLabel: "Filter",
			tagLabel: "Tag",
			dateLabel: "Date range",
			allTagsLabel: "All tags",
			empty: "No matching notes",
			emptyHint: "Try adjusting search or filters on the left.",
			noTags: "No tags",
			pinned: "Pinned",
			actionable: "Actionable",
			noted: "Noted",
			itemsSuffix: "items",
		},
	menu: {
		copyContent: "Copy content",
		editInline: "Edit memo",
		editContentPrompt: "Edit memo content",
		editTagsPrompt: "Update tags (comma-separated)",
		saveInline: "Save changes",
		cancelInline: "Cancel",
	},
	dateRange: {
		all: "All time",
		fromPrefix: "From",
		untilPrefix: "Until",
		},
	},
	zh: {
		bubble: "实时便签板",
		headline: "轻量化的便签流",
		subhead: "随手记录想法、即时打标签，在流畅的界面里保持节奏。",
		preferences: {
			title: "偏好设置",
			hint: "选择喜欢的主题配色和界面语言。",
			themeLabel: "主题配色",
			languageLabel: "语言",
			badge: "中文",
			languageNames: {
				en: "英语",
				zh: "中文",
			},
		},
		categoryLabels: {
			note: "笔记",
			idea: "想法",
			task: "任务",
			journal: "日记",
		},
		actions: {
			reset: "重置到示例",
			quickMemo: {
				label: "快速生成一条笔记",
				template: {
					content: "快速记录：草拟一份新手引导清单。",
					tags: ["note", "capture"],
					category: "note",
					pinned: false,
				},
			},
		},
		search: {
			title: "搜索与筛选",
			description: "左侧集中搜索、日历筛选和标签筛选，右侧即时刷新卡片。",
			placeholder: "搜索内容或 #标签",
			filterOptions: {
				all: { label: "全部", description: "所有记录的笔记" },
				pinned: { label: "置顶", description: "随时取用的重要事项" },
				tasks: { label: "任务", description: "可执行的待办或清单" },
				ideas: { label: "想法", description: "灵感与探索" },
				journal: { label: "日记", description: "日常记录与反思" },
				notes: { label: "笔记", description: "轻量的纯笔记" },
			},
		},
		calendar: {
			title: "日历筛选",
			description: "按时间窗口过滤帖子/笔记。",
			currentRange: "当前区间",
			select: "选择",
			today: "今天",
			last7: "最近7天",
			clear: "清除",
		},
		tags: {
			title: "标签筛选",
			description: "选择一个标签收敛结果，再次点击可清空。",
			empty: "暂无标签，保存时添加即可。",
		},
		pulse: {
			title: "统计快照",
			description: "轻量级的统计快照，帮助确认筛选后的体量。",
			totalTitle: "全部笔记",
			totalHint: "本地存储",
			pinnedTitle: "置顶",
			pinnedHint: "锚点",
			tasksTitle: "任务",
			tasksHint: "待处理",
		},
		composer: {
			title: "快速记录",
			description: "输入、打标签，快速落下一条笔记。",
			autosave: "自动保存在浏览器",
			placeholder: "写下想法、链接或清单...",
			categoryLabel: "类别",
			tagsLabel: "标签",
			tagsPlaceholder: "产品, 专注, 想法",
			pinTitle: "置顶",
			pinHint: "让它一直在视野里",
			save: "保存笔记",
			journalSeedLabel: "日记模板",
			journalSeedTemplate: {
				content: "今天学到：小步提交能帮我持续交付。",
				tags: ["journal", "learning"],
				category: "journal",
				pinned: false,
			},
			taskSeedLabel: "置顶任务",
			taskSeedTemplate: {
				content: "任务：闭环本周的反馈，准备下次笔记发布。",
				tags: ["task", "follow-up"],
				category: "task",
				pinned: true,
			},
		},
		memoList: {
			title: "笔记卡片",
			description: "左侧的搜索与筛选会实时作用，右侧卡片即时刷新。",
			filterLabel: "筛选",
			tagLabel: "标签",
			dateLabel: "日期区间",
			allTagsLabel: "所有标签",
			empty: "没有匹配的笔记",
			emptyHint: "尝试调整左侧搜索或筛选。",
			noTags: "暂无标签",
			pinned: "置顶",
			actionable: "可执行",
			noted: "已记录",
			itemsSuffix: "条",
		},
	menu: {
		copyContent: "复制内容",
		editInline: "直接编辑笔记",
		editContentPrompt: "编辑笔记内容",
		editTagsPrompt: "更新标签（用逗号分隔）",
		saveInline: "保存修改",
		cancelInline: "取消",
	},
	dateRange: {
		all: "全部时间",
		fromPrefix: "自",
		untilPrefix: "截至",
		},
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
	const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState("");
	const [editingTagsInput, setEditingTagsInput] = useState("");

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
		const rangeCopy = uiCopy[language].dateRange;
		if (!dateRange?.from && !dateRange?.to) {
			return rangeCopy.all;
		}
		if (dateRange?.from && dateRange?.to) {
			return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
		}
		if (dateRange?.from) {
			return `${rangeCopy.fromPrefix} ${format(dateRange.from, "MMM d")}`;
		}
		return `${rangeCopy.untilPrefix} ${format(dateRange?.to as Date, "MMM d")}`;
	}, [dateRange, language]);

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
		setEditingMemoId(memo.id);
		setEditingContent(memo.content);
		setEditingTagsInput(memo.tags.join(", "));
	};

	const handleCancelEdit = () => {
		setEditingMemoId(null);
		setEditingContent("");
		setEditingTagsInput("");
	};

	const handleUpdateMemo = () => {
		if (!editingMemoId) return;
		const trimmedContent = editingContent.trim();
		if (!trimmedContent) return;
		const updatedTags = editingTagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
		setMemos((prev) =>
			prev.map((item) =>
				item.id === editingMemoId
					? {
							...item,
							content: trimmedContent,
							tags: updatedTags,
							createdAt: new Date().toISOString(),
						}
					: item,
			),
		);
		handleCancelEdit();
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
	const localizedCopy = uiCopy[language];
	const activeFilterLabel =
		localizedCopy.search.filterOptions[filter]?.label ??
		localizedCopy.search.filterOptions.all.label;

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
								{localizedCopy.actions.reset}
							</Button>
							<Button
								className="gap-2"
								variant="default"
								type="button"
								onClick={() =>
									handleTemplate({
										...localizedCopy.actions.quickMemo.template,
									})
								}
							>
								<Wand2 className="h-4 w-4" />
								{localizedCopy.actions.quickMemo.label}
							</Button>
						</div>
					</div>
				</header>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-10 lg:items-start xl:grid-cols-10">
					<aside className="space-y-4 lg:sticky lg:top-8 lg:col-span-3">
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">
									{localizedCopy.search.title}
								</CardTitle>
								<CardDescription>
									{localizedCopy.search.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
									<Input
										placeholder={localizedCopy.search.placeholder}
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										className="pl-9"
									/>
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									{filterOptions.map((option) => {
										const active = filter === option.value;
										const labels = localizedCopy.search.filterOptions[option.value];
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
														{labels.label}
													</p>
													<p className="text-xs text-slate-500 transition group-hover:text-slate-600 dark:text-slate-300">
														{labels.description}
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
									{localizedCopy.calendar.title}
								</CardTitle>
								<CardDescription>
									{localizedCopy.calendar.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between gap-3 rounded-xl border bg-white/70 px-3 py-3 dark:border-white/10 dark:bg-white/5">
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											{localizedCopy.calendar.currentRange}
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
														: localizedCopy.calendar.select}
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
										{localizedCopy.calendar.today}
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
										{localizedCopy.calendar.last7}
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => setDateRange(undefined)}
									>
										{localizedCopy.calendar.clear}
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg">
									{localizedCopy.tags.title}
								</CardTitle>
								<CardDescription>
									{localizedCopy.tags.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								{tagUsage.length === 0 ? (
									<p className="text-sm text-slate-500 dark:text-slate-300">
										{localizedCopy.tags.empty}
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
								<CardTitle className="text-lg">
									{localizedCopy.pulse.title}
								</CardTitle>
								<CardDescription>
									{localizedCopy.pulse.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										{localizedCopy.pulse.totalTitle}
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.total}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{localizedCopy.pulse.totalHint}
									</p>
								</div>
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										{localizedCopy.pulse.pinnedTitle}
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.pinned}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{localizedCopy.pulse.pinnedHint}
									</p>
								</div>
								<div className="rounded-xl border bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="text-xs text-slate-500 dark:text-slate-300">
										{localizedCopy.pulse.tasksTitle}
									</p>
									<p className="text-2xl font-semibold text-slate-900 dark:text-white">
										{stats.tasks}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{localizedCopy.pulse.tasksHint}
									</p>
								</div>
							</CardContent>
						</Card>
					</aside>

					<section className="space-y-5 lg:col-span-7">
						<Card className="border-0 bg-white/80 shadow-lg ring-1 ring-slate-200 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<CardTitle>{localizedCopy.composer.title}</CardTitle>
										<CardDescription>
											{localizedCopy.composer.description}
										</CardDescription>
									</div>
									<div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex dark:text-slate-300">
										<Filter className="h-4 w-4" />
										{localizedCopy.composer.autosave}
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<Textarea
									placeholder={localizedCopy.composer.placeholder}
									value={content}
									onChange={(event) => setContent(event.target.value)}
									rows={4}
									className="resize-none bg-white/90 text-base dark:bg-white/5"
								/>
								<div className="grid gap-3 md:grid-cols-3">
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											{localizedCopy.composer.categoryLabel}
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
														{localizedCopy.categoryLabels[type]}
													</Button>
												),
											)}
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
											{localizedCopy.composer.tagsLabel}
										</p>
										<Input
											placeholder={localizedCopy.composer.tagsPlaceholder}
											value={tagsInput}
											onChange={(event) => setTagsInput(event.target.value)}
										/>
									</div>
									<div className="flex items-center justify-between rounded-xl border bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
										<div>
											<p className="text-sm font-medium text-slate-800 dark:text-white">
												{localizedCopy.composer.pinTitle}
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-300">
												{localizedCopy.composer.pinHint}
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
													...localizedCopy.composer.journalSeedTemplate,
												})
											}
										>
											<Flame className="h-4 w-4" />
											{localizedCopy.composer.journalSeedLabel}
										</Button>
										<Button
											type="button"
											variant="secondary"
											className="gap-2"
											onClick={() =>
												handleTemplate({
													...localizedCopy.composer.taskSeedTemplate,
												})
											}
										>
											<Pin className="h-4 w-4" />
											{localizedCopy.composer.taskSeedLabel}
										</Button>
									</div>
									<Button
										type="button"
										className="gap-2"
										disabled={!content.trim()}
										onClick={handleSave}
									>
										<Sparkles className="h-4 w-4" />
										{localizedCopy.composer.save}
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between gap-3">
									<CardTitle className="flex items-center gap-2">
										<LayoutList className={cn("h-5 w-5", activeTheme.heroIcon)} />
										{localizedCopy.memoList.title}
									</CardTitle>
									<Badge variant="secondary" className="text-xs">
										{filteredMemos.length} {localizedCopy.memoList.itemsSuffix}
									</Badge>
								</div>
								<CardDescription>
									{localizedCopy.memoList.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
									<div className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300/80 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
										<Filter className="h-4 w-4" />
										<span>{activeFilterLabel}</span>
									</div>
									<div className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300/80 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
										<Tag className="h-4 w-4" />
										<span>
											{activeTag ?? localizedCopy.memoList.allTagsLabel}
										</span>
									</div>
									<div className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300/80 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
										<CalendarIcon className="h-4 w-4" />
										<span>{dateRangeLabel}</span>
									</div>
								</div>
								{filteredMemos.length === 0 ? (
									<div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/60 px-4 py-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
										<Sparkles className="h-5 w-5" />
										<p>{localizedCopy.memoList.empty}</p>
										<p className="text-xs text-slate-500 dark:text-slate-300">
											{localizedCopy.memoList.emptyHint}
										</p>
									</div>
								) : (
									<div className="grid grid-cols-1 gap-4">
										{filteredMemos.map((memo) => {
											const isEditing = editingMemoId === memo.id;
											return (
												<div
													key={memo.id}
													className="flex h-full flex-col rounded-2xl border bg-white/80 px-4 py-4 shadow-sm ring-1 ring-slate-200/60 transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:ring-white/5"
												>
													<div className="flex flex-wrap items-center justify-between gap-3">
														<div className="flex items-center gap-2">
															<span
																className={cn(
																	"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
																	categoryAccent[memo.category],
																)}
															>
																{localizedCopy.categoryLabels[memo.category]}
															</span>
															{memo.pinned ? (
																<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
																	<Pin className="h-3 w-3" />
																	{localizedCopy.memoList.pinned}
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
																		{localizedCopy.menu.copyContent}
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		className="gap-2"
																		onClick={() => handleEditMemo(memo)}
																	>
																		<Edit className="h-4 w-4" />
																		{localizedCopy.menu.editInline}
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</div>
													<div className="mt-3 flex-1">
														{isEditing ? (
															<div className="space-y-3">
																<Textarea
																	value={editingContent}
																	onChange={(event) =>
																		setEditingContent(event.target.value)
																	}
																	className="min-h-[140px] text-sm"
																/>
																<div className="space-y-1">
																	<p className="text-xs font-medium text-slate-600 dark:text-slate-300">
																		{localizedCopy.composer.tagsLabel}
																	</p>
																	<Input
																		value={editingTagsInput}
																		onChange={(event) =>
																			setEditingTagsInput(event.target.value)
																		}
																		placeholder={localizedCopy.composer.tagsPlaceholder}
																		className="text-sm"
																	/>
																</div>
															</div>
														) : (
															<div className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 [&>*]:mb-3 [&>*:last-child]:mb-0 [&_a]:text-indigo-600 [&_a]:underline dark:[&_a]:text-indigo-300 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 dark:[&_blockquote]:border-white/10 [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-100 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_code]:bg-white/10 dark:[&_pre]:bg-white/5">
																<ReactMarkdown remarkPlugins={[remarkGfm]}>
																	{memo.content}
																</ReactMarkdown>
															</div>
														)}
													</div>
													{isEditing ? (
														<div className="mt-3 flex items-center gap-2">
															<Button
																size="sm"
																onClick={handleUpdateMemo}
																disabled={!editingContent.trim()}
															>
																{localizedCopy.menu.saveInline}
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={handleCancelEdit}
															>
																{localizedCopy.menu.cancelInline}
															</Button>
														</div>
													) : (
														<div className="mt-3 flex flex-wrap items-center gap-2">
															{memo.tags.length === 0 ? (
																<Badge variant="outline" className="text-xs">
																	{localizedCopy.memoList.noTags}
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
													)}
													<Separator className="my-3" />
													<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
														<div className="flex items-center gap-2">
															<BookmarkCheck className="h-4 w-4" />
															{memo.category === "task"
																? localizedCopy.memoList.actionable
																: localizedCopy.memoList.noted}
														</div>
														<span className="font-medium text-slate-700 dark:text-slate-200">
															{format(new Date(memo.createdAt), "MMM d, HH:mm")}
														</span>
													</div>
												</div>
											);
										})}
									</div>
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
						aria-label={localizedCopy.preferences.title}
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
						aria-label={localizedCopy.preferences.title}
					>
						<div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85">
							<div className="flex items-center justify-between gap-2">
								<div>
									<p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">
										{localizedCopy.preferences.title}
									</p>
									<p className="text-sm text-slate-600 dark:text-slate-300">
										{localizedCopy.preferences.hint}
									</p>
								</div>
								<Badge variant="secondary" className="text-[11px]">
									{localizedCopy.preferences.badge}
								</Badge>
							</div>
							<div className="mt-3 space-y-3">
								<div className="space-y-2">
									<p className="text-xs font-medium text-slate-500 dark:text-slate-300">
										{localizedCopy.preferences.themeLabel}
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
										{localizedCopy.preferences.languageLabel}
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
												{localizedCopy.preferences.languageNames[option]}
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
