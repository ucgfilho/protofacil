import { fireEvent, render, screen } from '@testing-library/vue';
import { nextTick } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseToast from '../components/BaseToast.vue';

describe('componentes acessíveis', () => {
  it('renderiza botão com texto visível', () => {
    render(BaseButton, { props: { icon: 'plus' }, slots: { default: 'Criar projeto' } });
    expect(screen.getByRole('button', { name: 'Criar projeto' })).toBeTruthy();
  });

  it('associa input ao label e erro', () => {
    render(BaseInput, {
      props: {
        id: 'email',
        name: 'email',
        label: 'E-mail',
        icon: 'email',
        modelValue: '',
        error: 'Informe um e-mail válido.'
      }
    });

    const input = screen.getByLabelText('E-mail');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain('Informe um e-mail válido.');
  });

  it('renderiza toast com aria-live', () => {
    render(BaseToast, { props: { message: 'Projeto criado com sucesso.', tone: 'success' } });
    expect(screen.getByRole('status').textContent).toContain('Projeto criado com sucesso.');
    expect(screen.getByRole('button', { name: 'Fechar aviso' })).toBeTruthy();
  });

  it('fecha toast ao acionar o botão de fechar', async () => {
    render(BaseToast, { props: { message: 'Projeto criado com sucesso.', tone: 'success' } });

    await fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('remove toast automaticamente depois de 10 segundos', async () => {
    vi.useFakeTimers();

    render(BaseToast, { props: { message: 'Projeto criado com sucesso.', tone: 'success' } });

    expect(screen.getByRole('status')).toBeTruthy();

    vi.advanceTimersByTime(10000);
    await nextTick();

    expect(screen.queryByRole('status')).toBeNull();
    vi.useRealTimers();
  });
});
