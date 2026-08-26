export const FORMAT_COLOR = {
  data:  { color: '#78BE20', bg: '#0a1810', border: '#1e4018' },
  video: { color: '#4a90d0', bg: '#0a1422', border: '#1a3060' },
  audio: { color: '#c040a0', bg: '#180a18', border: '#3a1040' },
}

export const ELEMENTS = {
  srt_input:    { name:'SRT Input',       cat:'IN',  group:'Input',   stripe:'#78BE20', inputs:[], outputs:[{id:'out',name:'Output',format:'data'}] },
  udp_input:    { name:'UDP Input',        cat:'IN',  group:'Input',   stripe:'#78BE20', inputs:[], outputs:[{id:'out',name:'Output',format:'data'}] },
  ndi_input:    { name:'NDI Input',        cat:'IN',  group:'Input',   stripe:'#78BE20', inputs:[], outputs:[{id:'out',name:'Output',format:'video'}] },
  srt_output:   { name:'SRT Output',       cat:'OUT', group:'Output',  stripe:'#4ea010', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[] },
  udp_output:   { name:'UDP Output',       cat:'OUT', group:'Output',  stripe:'#4ea010', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[] },
  ndi_output:   { name:'NDI Output',       cat:'OUT', group:'Output',  stripe:'#4ea010', inputs:[{id:'in',name:'Input',format:'video'}], outputs:[] },
  hevc_decoder: { name:'HEVC Decoder',     cat:'DEC', group:'Decode',  stripe:'#4a90d0', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[{id:'out',name:'Output',format:'video'}] },
  avc_decoder:  { name:'AVC Decoder',      cat:'DEC', group:'Decode',  stripe:'#4a90d0', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[{id:'out',name:'Output',format:'video'}] },
  aac_decoder:  { name:'AAC Decoder',      cat:'DEC', group:'Decode',  stripe:'#4a90d0', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[{id:'out',name:'Output',format:'audio'}] },
  aes302:       { name:'AES-302',          cat:'DEC', group:'Decode',  stripe:'#4a90d0', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[{id:'out',name:'Output',format:'audio'}] },
  hevc_encoder: { name:'HEVC Encoder',     cat:'ENC', group:'Encode',  stripe:'#c040a0', inputs:[{id:'in',name:'Input',format:'video'}], outputs:[{id:'out',name:'Output',format:'data'}] },
  avc_encoder:  { name:'AVC Encoder',      cat:'ENC', group:'Encode',  stripe:'#c040a0', inputs:[{id:'in',name:'Input',format:'video'}], outputs:[{id:'out',name:'Output',format:'data'}] },
  multiplexer:  { name:'Multiplexer',      cat:'MUX', group:'Routing', stripe:'#9060d0', inputs:[{id:'in',name:'Input',format:'data'}], outputs:[{id:'out',name:'Output',format:'data'}] },
  ts_router:    { name:'TS Router',        cat:'RTE', group:'Routing', stripe:'#20b8b8', inputs:[{id:'in',name:'TS Input',format:'data'}], outputs:[{id:'video',name:'Video',format:'video'},{id:'audio',name:'Audio',format:'audio'}] },
  av_sync:      { name:'A/V Sync',         cat:'SYN', group:'Routing', stripe:'#9060d0',
    inputs:[{id:'video_in',name:'Video',format:'video'},{id:'audio_in',name:'Audio',format:'audio'}],
    outputs:[{id:'video',name:'Video',format:'video'},{id:'audio',name:'Audio',format:'audio'}] },
  logo_inserter:{ name:'Logo Inserter',    cat:'OVL', group:'Utility', stripe:'#d07030', inputs:[{id:'in',name:'Input',format:'video'}], outputs:[{id:'out',name:'Output',format:'video'}] },
}

export const GROUP_ORDER = ['Input','Output','Decode','Encode','Routing','Utility']

export const LEGEND = [
  { label:'Input',   color:'#78BE20' },
  { label:'Output',  color:'#4ea010' },
  { label:'Decode',  color:'#4a90d0' },
  { label:'Encode',  color:'#c040a0' },
  { label:'Routing', color:'#9060d0' },
  { label:'Utility', color:'#d07030' },
]

// Edge colors by signal format — used by DeletableEdge and onConnect
export const EDGE_COLOR = {
  data:  '#78BE20',   // TS/data — lime green
  video: '#4a90d0',   // video   — blue
  audio: '#c040a0',   // audio   — pink/magenta
}

// Which elements have config=null, runtime_config=object (inverted schema)
// For av_sync and logo_inserter: the API config field must be null,
// and runtime_config carries the actual settings object.
export const RUNTIME_CONFIG_ELEMENTS = new Set(['av_sync', 'logo_inserter'])

// Default values matching the exact API schemas
export const DEFAULT_CONFIGS = {
  srt_input:    { addr: '0.0.0.0', port: 9000, mode: 'listener', latency: null, passphrase: null, stream_id: null },
  srt_output:   { port: 9001, addr: '0.0.0.0', mode: 'caller', latency: null, passphrase: null, stream_id: null, max_clients: null, destinations: null },
  udp_input:    { addr: '0.0.0.0', port: 5004, interface: '0.0.0.0' },
  udp_output:   { addr: '239.0.0.1', port: 5004, interface: '0.0.0.0', ttl: 32, pacing_bps: null, max_pacing_debt_ms: 20, ssrc: null },
  ndi_input:    { addr: '', name: '' },
  ndi_output:   { name: 'test_output', groups: '', clock_video: true, clock_audio: true },
  hevc_decoder: { pid: 256, hw_accel: 'software' },
  avc_decoder:  { pid: 256, hw_accel: 'software' },
  aac_decoder:  { pid: 257, bitstream_format: 'adts' },
  aes302:       { pid: 257 },
  hevc_encoder: { width: 1920, height: 1080, bitrate: 10000000, frame_rate_num: 25, frame_rate_den: 1, gop_length: 25, b_frames: 0, preset: 'main', rate_control: 'cbr', bit_depth: 'eight', input_format: 'rgba', performance: 16 },
  avc_encoder:  { width: 1920, height: 1080, bitrate: 10000000, frame_rate_num: 25, frame_rate_den: 1, gop_length: 25, b_frames: 0, profile: 'main', rate_control: 'cbr', performance: 16 },
  multiplexer:  { pmt_pid: 4096, program_number: 1, service_name: '', video_pid: 256, video_stream_type: 'avc' },
  ts_router:    { video_pid: 256, audio_pid: 257 },
  // av_sync and logo_inserter: these go in runtime_config, not config
  av_sync:      { audio_delay_ms: 0, video_delay_ms: 0, target_latency_ms: 80, max_drift_ms: 250, max_video_depth: 60, max_audio_depth: 100 },
  logo_inserter: { x_pos: 0, y_pos: 0 },
}

export const CONFIG_FIELDS = {
  srt_input: [
    { key:'addr',       label:'Address',       type:'text',   hint:'Bind address (listener) or remote host (caller)' },
    { key:'port',       label:'Port',          type:'number', min:0, max:65535 },
    { key:'mode',       label:'Mode',          type:'select', options:['listener','caller'] },
    { key:'latency',    label:'Latency (ms)',  type:'number', min:0, nullable:true },
    { key:'passphrase', label:'Passphrase',    type:'text',   nullable:true },
    { key:'stream_id',  label:'Stream ID',     type:'text',   nullable:true },
  ],
  srt_output: [
    { key:'addr',       label:'Destination',  type:'text' },
    { key:'port',       label:'Port',         type:'number', min:0, max:65535 },
    { key:'mode',       label:'Mode',         type:'select', options:['caller','listener'] },
    { key:'latency',    label:'Latency (ms)', type:'number', min:0, nullable:true },
    { key:'passphrase', label:'Passphrase',   type:'text',   nullable:true },
    { key:'stream_id',  label:'Stream ID',    type:'text',   nullable:true },
    { key:'max_clients',label:'Max Clients',  type:'number', min:0, nullable:true },
  ],
  udp_input: [
    { key:'addr',      label:'Address',   type:'text', hint:'Multicast group or local address' },
    { key:'port',      label:'Port',      type:'number', min:0, max:65535 },
    { key:'interface', label:'Interface', type:'text', hint:'Local interface IP (multicast)' },
  ],
  udp_output: [
    { key:'addr',               label:'Destination',        type:'text' },
    { key:'port',               label:'Port',               type:'number', min:0, max:65535 },
    { key:'interface',          label:'Local Interface',    type:'text' },
    { key:'ttl',                label:'TTL',                type:'number', min:0 },
    { key:'pacing_bps',         label:'Pacing Rate (bps)',  type:'number', min:0, nullable:true },
    { key:'max_pacing_debt_ms', label:'Max Pacing Debt (ms)', type:'number', min:0 },
    { key:'ssrc',               label:'RTP SSRC',           type:'number', nullable:true },
  ],
  ndi_input: [
    { key:'addr', label:'NDI Source Address', type:'text' },
    { key:'name', label:'NDI Source Name',    type:'text' },
  ],
  ndi_output: [
    { key:'name',        label:'NDI Output Name', type:'text' },
    { key:'groups',      label:'NDI Groups',      type:'text', hint:'Comma-separated group names' },
    { key:'clock_video', label:'Clock Video',     type:'bool' },
    { key:'clock_audio', label:'Clock Audio',     type:'bool' },
  ],
  hevc_decoder: [
    { key:'pid',      label:'Video PID',           type:'number', min:0, max:8191 },
    { key:'hw_accel', label:'Hardware Accel',      type:'select', options:['software','nvdec','iqsv'] },
  ],
  avc_decoder: [
    { key:'pid',      label:'Video PID',           type:'number', min:0, max:8191 },
    { key:'hw_accel', label:'Hardware Accel',      type:'select', options:['software','nvdec','iqsv'] },
  ],
  aac_decoder: [
    { key:'pid',              label:'Audio PID',        type:'number', min:0, max:8191 },
    { key:'bitstream_format', label:'Bitstream Format', type:'select', options:['adts','adif','raw_aac','loas','latm'] },
  ],
  aes302: [
    { key:'pid', label:'Audio PID', type:'number', min:0, max:8191 },
  ],
  hevc_encoder: [
    { key:'width',          label:'Width',           type:'number', min:1 },
    { key:'height',         label:'Height',          type:'number', min:1 },
    { key:'bitrate',        label:'Bitrate (bps)',   type:'number', min:1 },
    { key:'frame_rate_num', label:'Frame Rate Num',  type:'number', min:1 },
    { key:'frame_rate_den', label:'Frame Rate Den',  type:'number', min:1 },
    { key:'gop_length',     label:'GOP Length',      type:'number', min:1 },
    { key:'b_frames',       label:'B-frames',        type:'number', min:0 },
    { key:'preset',         label:'Preset',          type:'select', options:['multi','main','main_10','main_42210','main_still','main_intra'] },
    { key:'rate_control',   label:'Rate Control',    type:'select', options:['cbr','vbr','cqp','aqp','crf'] },
    { key:'bit_depth',      label:'Bit Depth',       type:'select', options:['eight','ten'] },
    { key:'input_format',   label:'Input Format',    type:'select', options:['rgba','i_420','uyvy'] },
    { key:'performance',    label:'Performance',     type:'number', min:0 },
  ],
  avc_encoder: [
    { key:'width',          label:'Width',           type:'number', min:1 },
    { key:'height',         label:'Height',          type:'number', min:1 },
    { key:'bitrate',        label:'Bitrate (bps)',   type:'number', min:1 },
    { key:'frame_rate_num', label:'Frame Rate Num',  type:'number', min:1 },
    { key:'frame_rate_den', label:'Frame Rate Den',  type:'number', min:1 },
    { key:'gop_length',     label:'GOP Length',      type:'number', min:1 },
    { key:'b_frames',       label:'B-frames',        type:'number', min:0 },
    { key:'profile',        label:'Profile',         type:'select', options:['baseline','main','high'] },
    { key:'rate_control',   label:'Rate Control',    type:'select', options:['cbr','vbr','cqp','aqp','crf'] },
    { key:'performance',    label:'Performance',     type:'number', min:0 },
  ],
  multiplexer: [
    { key:'pmt_pid',         label:'PMT PID',         type:'number', min:0, max:8191 },
    { key:'program_number',  label:'Program Number',  type:'number', min:0 },
    { key:'service_name',    label:'Service Name',    type:'text' },
    { key:'video_pid',       label:'Video PID',       type:'number', min:0, max:8191 },
    { key:'video_stream_type', label:'Video Stream Type', type:'select', options:['avc','hevc'] },
  ],
  ts_router: [
    { key:'video_pid', label:'Video PID', type:'number', min:0, max:8191 },
    { key:'audio_pid', label:'Audio PID', type:'number', min:0, max:8191 },
  ],
  // av_sync goes in runtime_config (schema is inverted)
  av_sync: [
    { key:'audio_delay_ms',    label:'Audio Delay (ms)',         type:'number', min:0, max:2000 },
    { key:'video_delay_ms',    label:'Video Delay (ms)',         type:'number', min:0, max:2000 },
    { key:'target_latency_ms', label:'Presentation Buffer (ms)', type:'number', min:0, max:2000 },
    { key:'max_drift_ms',      label:'Reanchor Drift (ms)',      type:'number', min:10, max:5000 },
    { key:'max_video_depth',   label:'Max Video Buffer',         type:'number', min:1, max:240 },
    { key:'max_audio_depth',   label:'Max Audio Buffer',         type:'number', min:1, max:1000 },
  ],
  // logo_inserter goes in runtime_config
  logo_inserter: [
    { key:'x_pos', label:'X Position (px)', type:'number', min:0 },
    { key:'y_pos', label:'Y Position (px)', type:'number', min:0 },
  ],
}

/**
 * Fields that are allowed to be null in the API (oneOf: [null, type]).
 * These will be serialized as null when empty.
 */
export const NULLABLE_FIELDS = {
  srt_input:    new Set(['latency','passphrase','stream_id','addr']),
  srt_output:   new Set(['latency','passphrase','stream_id','addr','max_clients','destinations']),
  udp_output:   new Set(['pacing_bps','ssrc']),
  ndi_input:    new Set([]),
  ndi_output:   new Set([]),         // groups and name are NON-nullable strings
  hevc_decoder: new Set([]),         // hw_accel is a required enum
  avc_decoder:  new Set([]),
  aac_decoder:  new Set([]),
  aes302:       new Set([]),
  hevc_encoder: new Set([]),
  avc_encoder:  new Set([]),
  multiplexer:  new Set([]),
  ts_router:    new Set([]),
  av_sync:      new Set([]),
  logo_inserter:new Set([]),
  udp_input:    new Set([]),
}

/**
 * Fields that are strings in the API but NOT nullable — must be '' not null.
 * Sending null for these causes "expected a string" errors.
 */
export const NON_NULLABLE_STRING_FIELDS = {
  ndi_output:   new Set(['name','groups']),
  multiplexer:  new Set(['service_name']),
  ndi_input:    new Set(['addr','name']),
}
