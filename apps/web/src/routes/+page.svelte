<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { Project } from '@ama-planner/core';
	import { Plus, Calendar, Target, Clock } from 'lucide-svelte';

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

	$: totalHours = projects.reduce((sum, p) => sum + p.estHours, 0);
	$: highPriority = projects.filter(p => p.priority >= 4).length;
	$: overdue = projects.filter(p => new Date(p.dueDate) < new Date()).length;
</script>

<svelte:head>
	<title>Dashboard - AMA Planner</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
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
	{:else}
		<!-- Stats -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Target class="h-6 w-6 text-gray-400" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
								<dd class="text-lg font-medium text-gray-900">{projects.length}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Clock class="h-6 w-6 text-gray-400" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
								<dd class="text-lg font-medium text-gray-900">{totalHours.toFixed(1)}h</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Target class="h-6 w-6 text-red-400" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">High Priority</dt>
								<dd class="text-lg font-medium text-gray-900">{highPriority}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Calendar class="h-6 w-6 text-orange-400" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Overdue</dt>
								<dd class="text-lg font-medium text-gray-900">{overdue}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Projects -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Projects</h3>
				{#if projects.length === 0}
					<div class="text-center py-8">
						<Calendar class="mx-auto h-12 w-12 text-gray-400" />
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
					<div class="overflow-hidden">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Project
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Priority
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Due Date
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Hours
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each projects.slice(0, 5) as project}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm font-medium text-gray-900">{project.title}</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												{project.category}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {project.priority >= 4
													? 'bg-red-100 text-red-800'
													: project.priority >= 3
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-green-100 text-green-800'}"
											>
												{project.priority}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(project.dueDate).toLocaleDateString()}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{project.estHours}h
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if projects.length > 5}
						<div class="mt-4 text-center">
							<a href="/projects" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
								View all projects →
							</a>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div> 