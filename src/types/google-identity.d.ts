declare namespace GoogleIdentity {
  interface CredentialResponse {
    credential: string;
    select_by: string;
    clientId: string;
  }

  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
  }

  interface GsiButtonConfiguration {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  }
}

declare const google: {
  accounts: {
    id: {
      initialize: (config: GoogleIdentity.IdConfiguration) => void;
      renderButton: (parent: HTMLElement, options: GoogleIdentity.GsiButtonConfiguration) => void;
    };
  };
};
