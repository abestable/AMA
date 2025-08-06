<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { DollarSign, Calendar, Plus, LogOut } from 'lucide-svelte';

	let user: { id: string; email: string } | null = null;

	onMount(() => {
		const token = localStorage.getItem('token');
		if (token) {
			api.setToken(token);
			// In a real app, you'd validate the token here
		}
	});

	function logout() {
		api.clearToken();
		localStorage.removeItem('token');
		user = null;
		goto('/login');
	}
</script>

<svelte:head>
	<title>AMA Planner</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{#if $page.url.pathname !== '/login' && $page.url.pathname !== '/register'}
		<nav class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<a href="/" class="flex items-center space-x-2 text-xl font-bold text-gray-900">
							<Calendar class="w-6 h-6" />
							<span>AMA Planner</span>
						</a>
					</div>
					<div class="flex items-center space-x-4">
						<a href="/" class="text-gray-600 hover:text-gray-900">Dashboard</a>
						<a href="/projects" class="text-gray-600 hover:text-gray-900">Projects</a>
						<a href="/plan" class="text-gray-600 hover:text-gray-900">Plan</a>
						<a href="#" class="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
							<DollarSign class="w-4 h-4" />
							<span>Finanze (coming soon)</span>
						</a>
						<button
							on:click={logout}
							class="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
						>
							<LogOut class="w-4 h-4" />
							<span>Logout</span>
						</button>
					</div>
				</div>
			</div>
		</nav>
	{/if}

	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<slot />
	</main>
</div> 