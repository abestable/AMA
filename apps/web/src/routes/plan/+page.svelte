<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import type { Project, AgendaBlock, EnergyLevel } from '@ama-planner/core';
	import { Calendar, Zap, Clock, Save, RefreshCw } from 'lucide-svelte';

	let projects: Project[] = [];
	let draftBlocks: AgendaBlock[] = [];
	let loading = false;
	let generating = false;
	let error = '';
	
	let horizonHours = 72;
	let energy: EnergyLevel = 'med';
	let totalHours = 0;

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

	async function generateDraft() {
		if (projects.length === 0) {
			error = 'No projects available for planning';
			return;
		}

		generating = true;
		error = '';

		const result = await api.generatePlan(horizonHours, energy);
		
		if (result.error) {
			error = result.error;
		} else if (result.data) {
			draftBlocks = result.data.blocks;
			totalHours = result.data.totalHours;
		}

		generating = false;
	}

	async function savePlan() {
		if (draftBlocks.length === 0) {
			error = 'No draft to save';
			return;
		}

		loading = true;
		error = '';

		const blocksToSave = draftBlocks.map(({ projectId, start, end }) => ({
			projectId,
			start,
			end
		}));

		const result = await api.confirmPlan(blocksToSave);
		
		if (result.error) {
			error = result.error;
		} else {
			// Clear draft after successful save
			draftBlocks = [];
			totalHours = 0;
		}

		loading = false;
	}

	$: projectMap = new Map(projects.map(p => [p.id, p]));
</script>

<svelte:head>
	<title>Plan Agenda - AMA Planner</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Plan Agenda</h1>
		<div class="flex space-x-2">
			<button
				on:click={generateDraft}
				disabled={generating || projects.length === 0}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
			>
				{#if generating}
					<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
				{:else}
					<RefreshCw class="w-4 h-4 mr-2" />
				{/if}
				Generate Draft
			</button>
			{#if draftBlocks.length > 0}
				<button
					on:click={savePlan}
					disabled={loading}
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
				>
					<Save class="w-4 h-4 mr-2" />
					Save Plan
				</button>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-md p-4">
			<p class="text-red-800">{error}</p>
		</div>
	{/if}

	<!-- Planning Controls -->
	<div class="bg-white shadow rounded-lg p-6">
		<h2 class="text-lg font-medium text-gray-900 mb-4">Planning Parameters</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="horizon" class="block text-sm font-medium text-gray-700 mb-2">
					<Clock class="w-4 h-4 inline mr-1" />
					Planning Horizon
				</label>
				<select
					id="horizon"
					bind:value={horizonHours}
					class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
				>
					<option value={24}>24 hours (1 day)</option>
					<option value={48}>48 hours (2 days)</option>
					<option value={72}>72 hours (3 days)</option>
					<option value={168}>168 hours (1 week)</option>
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					<Zap class="w-4 h-4 inline mr-1" />
					Energy Level
				</label>
				<div class="flex space-x-4">
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={energy}
							value="low"
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
						/>
						<span class="ml-2 text-sm text-gray-700">Low</span>
					</label>
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={energy}
							value="med"
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
						/>
						<span class="ml-2 text-sm text-gray-700">Medium</span>
					</label>
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={energy}
							value="high"
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
						/>
						<span class="ml-2 text-sm text-gray-700">High</span>
					</label>
				</div>
			</div>
		</div>

		<div class="mt-4 p-4 bg-gray-50 rounded-md">
			<h3 class="text-sm font-medium text-gray-700 mb-2">Available Projects</h3>
			{#if projects.length === 0}
				<p class="text-sm text-gray-500">No projects available. Create some projects first.</p>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
					{#each projects as project}
						<div class="text-sm">
							<span class="font-medium">{project.title}</span>
							<span class="text-gray-500"> ({project.estHours}h)</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Draft Results -->
	{#if draftBlocks.length > 0}
		<div class="bg-white shadow rounded-lg p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-medium text-gray-900">Generated Draft</h2>
				<div class="text-sm text-gray-500">
					Total: {totalHours.toFixed(1)} hours
				</div>
			</div>

			<div class="space-y-3">
				{#each draftBlocks as block}
					{@const project = projectMap.get(block.projectId)}
					{#if project}
						<div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
							<div class="flex-1">
								<div class="font-medium text-gray-900">{project.title}</div>
								<div class="text-sm text-gray-500">
									{new Date(block.start).toLocaleString()} - {new Date(block.end).toLocaleTimeString()}
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
									{project.category}
								</span>
								<span class="text-sm text-gray-500">
									{((new Date(block.end).getTime() - new Date(block.start).getTime()) / (1000 * 60 * 60)).toFixed(1)}h
								</span>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
		</div>
	{/if}
</div> 