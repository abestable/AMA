<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let title = '';
	let category = '';
	let valenza = 3;
	let estHours = 1.0;
	let priority = 3;
	let dueDate = '';
	let loading = false;
	let error = '';
	let projectId = '';

	onMount(async () => {
		projectId = $page.params.id || '';
		
		if (!projectId) {
			error = 'Invalid project ID';
			return;
		}
		
		try {
			// Load project data
			const result = await api.getProject(projectId);
			if (result.data) {
				const project = result.data;
				title = project.title;
				category = project.category;
				valenza = project.valenza;
				estHours = project.estHours;
				priority = project.priority;
				dueDate = project.dueDate;
			} else {
				error = 'Project not found';
			}
		} catch (err) {
			error = 'Failed to load project';
		}
	});

	async function handleSubmit() {
		if (!title || !category || !dueDate) {
			error = 'Please fill in all required fields';
			return;
		}

		loading = true;
		error = '';

		const result = await api.updateProject(projectId, {
			title,
			category,
			valenza,
			estHours,
			priority,
			dueDate
		});

		if (result.error) {
			error = result.error;
		} else {
			goto('/projects');
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Edit Project - AMA Planner</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">Edit Project</h1>
		<p class="mt-2 text-gray-600">Update your project details.</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
			<p class="text-red-800">{error}</p>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700">Project Title *</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				required
				class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				placeholder="Enter project title"
			/>
		</div>

		<div>
			<label for="category" class="block text-sm font-medium text-gray-700">Category *</label>
			<select
				id="category"
				bind:value={category}
				required
				class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="">Select category</option>
				<option value="lavoro">Lavoro</option>
				<option value="famiglia">Famiglia</option>
				<option value="studio">Studio</option>
				<option value="hobby">Hobby</option>
				<option value="salute">Salute</option>
				<option value="altro">Altro</option>
			</select>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="valenza" class="block text-sm font-medium text-gray-700">Importance (Valenza) *</label>
				<select
					id="valenza"
					bind:value={valenza}
					required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				>
					<option value={1}>1 - Very Low</option>
					<option value={2}>2 - Low</option>
					<option value={3}>3 - Medium</option>
					<option value={4}>4 - High</option>
					<option value={5}>5 - Very High</option>
				</select>
			</div>

			<div>
				<label for="priority" class="block text-sm font-medium text-gray-700">Priority (Urgency) *</label>
				<select
					id="priority"
					bind:value={priority}
					required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				>
					<option value={1}>1 - Very Low</option>
					<option value={2}>2 - Low</option>
					<option value={3}>3 - Medium</option>
					<option value={4}>4 - High</option>
					<option value={5}>5 - Very High</option>
				</select>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="estHours" class="block text-sm font-medium text-gray-700">Estimated Hours *</label>
				<input
					id="estHours"
					type="number"
					bind:value={estHours}
					min="0.5"
					step="0.5"
					required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date *</label>
				<input
					id="dueDate"
					type="date"
					bind:value={dueDate}
					required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
		</div>

		<div class="flex justify-end space-x-3">
			<button
				type="button"
				on:click={() => goto('/projects')}
				class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={loading}
				class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
			>
				{#if loading}
					Updating...
				{:else}
					Update Project
				{/if}
			</button>
		</div>
	</form>
</div> 