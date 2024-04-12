<script lang="ts">
	import { deviceType, supportsWebGpu } from "../store";
  
	import Topnav from "../components/Topnav.svelte";
	import Footer from "../components/Footer.svelte";
	import ChatInterface from "../components/ChatInterface.svelte";
	import UnsupportedDeviceBanner from "../components/UnsupportedDeviceBanner.svelte";
	import UnsupportedBrowserBanner from "../components/UnsupportedBrowserBanner.svelte";
  </script>
  
  <Topnav />
  
  {#if !(deviceType === 'desktop' || deviceType === 'Android')}
	<UnsupportedDeviceBanner />
  {:else if !supportsWebGpu}
	<UnsupportedBrowserBanner />
  {/if}
  
  <ChatInterface />
  
  <Footer />


