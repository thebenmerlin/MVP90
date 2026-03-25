export const dynamic = 'force-dynamic';

interface SignalUpdatePayload {
  id: number;
  metric?: 'noveltyScore' | 'estimatedBuildCost' | 'traction';
  valueChange?: string | number;
}

export async function GET() {
  const encoder = new TextEncoder();

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Simulate live data updates every 3 seconds
      const interval = setInterval(() => {
        // Pick a random startup ID to update (1 to 5)
        const id = Math.floor(Math.random() * 5) + 1;

        // Randomly adjust one of the volatile metrics
        const updateType = Math.random();
        const payload: any = { id };

        if (updateType < 0.33) {
          // Update novelty score slightly (-0.2 to +0.2)
          payload.metric = 'noveltyScore';
          payload.valueChange = (Math.random() * 0.4 - 0.2).toFixed(1);
        } else if (updateType < 0.66) {
          // Update build cost slightly (-$5K to +$5K)
          payload.metric = 'estimatedBuildCost';
          payload.valueChange = Math.floor((Math.random() * 10000) - 5000);
        } else {
          // Add a new github star or twitter follower
          payload.metric = 'traction';
          payload.valueChange = Math.floor(Math.random() * 5) + 1;
        }

        const data = `data: ${JSON.stringify(payload)}\n\n`;
        try {
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          clearInterval(interval);
        }
      }, 3000);

      // Clean up when the connection is closed
      // This is necessary to avoid memory leaks if the client disconnects
      // The Next.js request object doesn't provide an easy 'close' event here,
      // but returning from start() is fine; the controller handles backpressure.
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
