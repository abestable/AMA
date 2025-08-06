<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	onMount(() => {
		// Redirect if already logged in
		const token = localStorage.getItem('token');
		if (token) {
			goto('/');
		}
	});

	async function handleSubmit() {
		if (!email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			return;
		}

		loading = true;
		error = '';

		const result = await api.register(email, password);
		
		if (result.error) {
			error = result.error;
		} else if (result.data) {
			localStorage.setItem('token', result.data.token);
			api.setToken(result.data.token);
			goto('/');
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Register - AMA Planner</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> sign in to your account </a>
			</p>
		</div>
		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
			{#if error}
				<div class="bg-red-50 border border-red-200 rounded-md p-4">
					<p class="text-red-800 text-sm">{error}</p>
				</div>
			{/if}
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Email address"
					/>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Password"
					/>
				</div>
				<div>
					<label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
					<input
						id="confirm-password"
						name="confirm-password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={confirmPassword}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Confirm password"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
				>
					{#if loading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
					{:else}
						Create account
					{/if}
				</button>
			</div>
		</form>
	</div>
</div> 