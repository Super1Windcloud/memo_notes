"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCounterStore } from "@/lib/store/counterStore";
import { supabase } from "@/lib/supabase-client";

// Example function to fetch data from Supabase
const fetchExampleData = async () => {
	// This is just an example. In a real app, you would have an actual table to query
	return { message: "Data fetched from Supabase" };
};

export default function IntegrationDemo() {
	const { count, increment, decrement, reset } = useCounterStore();

	const {
		data: exampleData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exampleData"],
		queryFn: fetchExampleData,
	});

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-8">Integration Demo</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Zustand Example */}
				<Card>
					<CardHeader>
						<CardTitle>Zustand State Management</CardTitle>
						<CardDescription>
							Global state management with minimal setup
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<h2 className="text-2xl font-semibold">Count: {count}</h2>
							<div className="flex gap-2">
								<Button onClick={increment}>+</Button>
								<Button onClick={decrement}>-</Button>
								<Button variant="outline" onClick={reset}>
									Reset
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* TanStack Query Example */}
				<Card>
					<CardHeader>
						<CardTitle>TanStack Query</CardTitle>
						<CardDescription>
							Data fetching, caching, and state management
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading && <p>Loading...</p>}
						{error && (
							<p className="text-red-500">Error: {(error as Error).message}</p>
						)}
						{exampleData && <p>{exampleData.message}</p>}
						<p className="mt-2 text-sm text-gray-500">
							This demonstrates automatic caching and re-fetching of data
						</p>
					</CardContent>
				</Card>

				{/* Auth Placeholder */}
				<Card>
					<CardHeader>
						<CardTitle>Authentication</CardTitle>
						<CardDescription>Plug in your auth provider of choice</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							This template no longer bundles NextAuth. Add your preferred
							provider (Clerk, Auth.js, Supabase Auth, etc.) and wrap your app
							accordingly.
						</p>
						<Button variant="outline" className="mt-3" asChild>
							<a
								href="https://nextjs.org/docs/app/building-your-application/authentication"
								target="_blank"
								rel="noreferrer"
							>
								View auth options
							</a>
						</Button>
					</CardContent>
				</Card>

				{/* Supabase Example */}
				<Card>
					<CardHeader>
						<CardTitle>Supabase Integration</CardTitle>
						<CardDescription>
							Real-time database and authentication
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p>Supabase client is configured and ready to use</p>
						<p className="mt-2 text-sm text-gray-500">
							Use import &#123; supabase &#125; from '@/lib/supabase-client' to
							access the client
						</p>
						<div className="mt-4">
							<code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
								{`const { data, error } = await supabase.from('table').select('*')`}
							</code>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
