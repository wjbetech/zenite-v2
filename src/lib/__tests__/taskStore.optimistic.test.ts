import useTaskStore from '../taskStore';
import api from '../api';

jest.mock('../api');

describe('taskStore optimistic operations', () => {
  beforeEach(() => {
    // reset store
    useTaskStore.setState({ tasks: [], pending: {}, loading: false, error: null });
    jest.clearAllMocks();
  });

  it('applies optimistic update immediately and commits on success', async () => {
    // prepare initial task
    const initial = {
      id: 't1',
      title: 'Initial',
      createdAt: new Date().toISOString(),
    };
    useTaskStore.setState({ tasks: [initial] });

    // mock api.updateTask to resolve with updated payload
    (api.updateTask as jest.Mock).mockResolvedValueOnce({
      id: 't1',
      title: 'Changed',
      createdAt: initial.createdAt,
    });

    const promise = useTaskStore.getState().updateTaskOptimistic('t1', { title: 'Changed' });

    // optimistic should be applied synchronously
    const mid = useTaskStore.getState().tasks.find((t) => t.id === 't1')!;
    expect(mid.title).toBe('Changed');

    const result = await promise;
    expect(result.title).toBe('Changed');
    const final = useTaskStore.getState().tasks.find((t) => t.id === 't1')!;
    expect(final.title).toBe('Changed');
  });

  it('reverts optimistic update on failure', async () => {
    const initial = { id: 't2', title: 'Before', createdAt: new Date().toISOString() };
    useTaskStore.setState({ tasks: [initial] });

    (api.updateTask as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const p = useTaskStore.getState().updateTaskOptimistic('t2', { title: 'Bad' });

    // optimistic applied
    expect(useTaskStore.getState().tasks.find((t) => t.id === 't2')!.title).toBe('Bad');

    await expect(p).rejects.toThrow('fail');

    // reverted
    expect(useTaskStore.getState().tasks.find((t) => t.id === 't2')!.title).toBe('Before');
  });

  it('handles out-of-order responses by not overwriting newer optimistic change', async () => {
    const initial = { id: 't3', title: 'Start', createdAt: new Date().toISOString() };
    useTaskStore.setState({ tasks: [initial] });

    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    const first = new Promise((res) => {
      resolveFirst = res;
    });
    const second = new Promise((res) => {
      resolveSecond = res;
    });

    (api.updateTask as jest.Mock)
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() => second);

    const p1 = useTaskStore.getState().updateTaskOptimistic('t3', { title: 'A' });
    const p2 = useTaskStore.getState().updateTaskOptimistic('t3', { title: 'B' });

    // after two optimistic updates, current should be 'B'
    expect(useTaskStore.getState().tasks.find((t) => t.id === 't3')!.title).toBe('B');

    // resolve first (older) with a payload that would set title to 'A-server'
    resolveFirst({ id: 't3', title: 'A-server', createdAt: initial.createdAt });
    await p1; // wait for first to settle

    // still 'B' because second optimistic superseded first
    expect(useTaskStore.getState().tasks.find((t) => t.id === 't3')!.title).toBe('B');

    // resolve second
    resolveSecond({ id: 't3', title: 'B-server', createdAt: initial.createdAt });
    await p2;

    expect(useTaskStore.getState().tasks.find((t) => t.id === 't3')!.title).toBe('B-Server');
  });
});
