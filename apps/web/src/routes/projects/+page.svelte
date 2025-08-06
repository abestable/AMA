<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { Project } from '@ama-planner/core';
	import { Plus, Edit, Trash2 } from 'lucide-svelte';

	let projects: Project[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		loading = true;
		const result = await api.getProjects();
		if (result.error) {
			error = result.error;
		} else {
			projects = result.data || [];
		}
		loading = false;
	}

	async function deleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;
		
		const result = await api.deleteProject(id);
		if (!result.error) {
			await loadProjects();
		}
	}
</script>

<svelte:head>
	<title>Projects - AMA Planner</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Projects</h1>
		<a
			href="/projects/new"
			class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
		>
			<Plus class="w-4 h-4 mr-2" />
			Add Project
		</a>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-md p-4">
			<p class="text-red-800">{error}</p>
		</div>
	{:else if projects.length === 0}
		<div class="text-center py-12">
			<h3 class="mt-2 text-sm font-medium text-gray-900">No projects</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
			<div class="mt-6">
				<a
					href="/projects/new"
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
				>
					<Plus class="w-4 h-4 mr-2" />
					Add Project
				</a>
			</div>
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each projects as project}
					<li>
						<div class="px-4 py-4 flex items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center justify-between">
									<p class="text-sm font-medium text-blue-600 truncate">{project.title}</p>
									<div class="ml-2 flex-shrink-0 flex">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											{project.category}
										</span>
									</div>
								</div>
								<div class="mt-2 sm:flex sm:justify-between">
									<div class="sm:flex">
										<p class="flex items-center text-sm text-gray-500">
											Priority: {project.priority}/5
										</p>
										<p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
											Importance: {project.valenza}/5
										</p>
									</div>
									<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
										<p>Due: {new Date(project.dueDate).toLocaleDateString()}</p>
										<p class="ml-4">{project.estHours}h</p>
									</div>
								</div>
							</div>
							<div class="flex space-x-2">
								<a
									href="/projects/{project.id}/edit"
									class="text-gray-400 hover:text-gray-500"
								>
									<Edit class="w-4 h-4" />
								</a>
								<button
									on:click={() => deleteProject(project.id)}
									class="text-gray-400 hover:text-red-500"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div> 