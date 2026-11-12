/* A small, working scheduling demo. All durations are illustrative time units. */
(() => {
  'use strict';
  const processes = [
    { id: 'P1', arrival: 0, burst: 5, color: '#c5df96' },
    { id: 'P2', arrival: 1, burst: 3, color: '#93bfa0' },
    { id: 'P3', arrival: 2, burst: 1, color: '#e3cb8b' },
    { id: 'P4', arrival: 3, burst: 2, color: '#a5bdd5' }
  ];
  const notes = {
    fcfs: 'Processes run in arrival order.',
    sjf: 'The shortest ready job runs next. Running jobs finish first.',
    rr: 'Each ready process gets up to 2 time units per turn.',
    srtf: 'The process with the least remaining time runs first.'
  };
  function schedule(algorithm) {
    const jobs = processes.map(p => ({ ...p, remaining: p.burst, completed: null }));
    const segments = [];
    const queue = [];
    const enqueued = new Set();
    let time = 0;
    function enqueueArrivals() {
      for (const job of jobs) {
        if (job.arrival <= time && !enqueued.has(job.id)) {
          queue.push(job);
          enqueued.add(job.id);
        }
      }
    }
    function run(job, duration) {
      const last = segments[segments.length - 1];
      if (last && last.id === job.id && last.end === time) last.end += duration;
      else segments.push({ id: job.id, start: time, end: time + duration, color: job.color });
      time += duration;
      job.remaining -= duration;
      if (job.remaining === 0) job.completed = time;
    }
    while (jobs.some(job => job.remaining > 0)) {
      if (algorithm === 'rr') {
        enqueueArrivals();
        if (queue.length === 0) { time++; continue; }
        const job = queue.shift();
        run(job, Math.min(2, job.remaining));
        enqueueArrivals();
        if (job.remaining > 0) queue.push(job);
      } else {
        const ready = jobs.filter(job => job.arrival <= time && job.remaining > 0);
        if (ready.length === 0) { time++; continue; }
        ready.sort((a, b) => {
          if (algorithm === 'sjf') return a.burst - b.burst || a.arrival - b.arrival;
          if (algorithm === 'srtf') return a.remaining - b.remaining || a.arrival - b.arrival;
          return a.arrival - b.arrival;
        });
        const job = ready[0];
        run(job, algorithm === 'srtf' ? 1 : job.remaining);
      }
    }
    const averageWait = jobs.reduce((total, job) => total + job.completed - job.arrival - job.burst, 0) / jobs.length;
    return { segments, averageWait };
  }
  const selector = document.querySelector('#algorithm');
  const chart = document.querySelector('#schedule-chart');
  function renderSchedule() {
    const { segments, averageWait } = schedule(selector.value);
    chart.replaceChildren();
    for (const segment of segments) {
      const bar = document.createElement('span');
      bar.className = 'schedule-block';
      bar.style.flex = String(segment.end - segment.start);
      bar.style.backgroundColor = segment.color;
      bar.textContent = segment.id;
      bar.setAttribute('aria-hidden', 'true');
      bar.title = `${segment.id}: ${segment.start}–${segment.end}`;
      chart.append(bar);
    }
    chart.setAttribute('aria-label', segments.map(segment => `${segment.id} from ${segment.start} to ${segment.end}`).join('; '));
    document.querySelector('#average-wait').textContent = averageWait.toFixed(2);
    document.querySelector('#algorithm-note').textContent = notes[selector.value];
  }
  selector.addEventListener('change', renderSchedule);
  renderSchedule();
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();
