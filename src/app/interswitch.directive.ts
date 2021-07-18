import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
  Renderer2
} from "@angular/core";
import { DOCUMENT } from "@angular/common";

interface ISWWindow extends Window {
  webpayCheckout: Function;
  paymentCallback: Function;
}

interface ISWRequest {
  mode: string;
  merchant_code: string;
  amount: string;
  site_redirect_url: string;
  onComplete: (response) => void;
  currency: number;
  pay_item_id: string;
  txn_ref: string;
  cust_id: string;
  cust_name: string;
  split_accounts: string;
}

declare var window: ISWWindow;

@Directive({
  selector: "[payWithISW]"
})
export class InterswitchDirective implements OnInit {
  // @Input() payment: Partial<PendingPayment>;

  // @Input() amount: number;

  // @Input() split: [];

  private request: ISWRequest;

  @Output() callback: EventEmitter<any> = new EventEmitter<any>();

  private script: HTMLScriptElement;

  private iswPaymentGateway =
    "https://qa.interswitchng.com/collections/public/javascripts/inline-checkout.js";

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.request = {
      cust_id: "peter@parker.com ",
      cust_name: "Peter Parker",
      merchant_code: "MX13948",
      pay_item_id: "9144214",
      txn_ref: "SMV-WEB-ISW-EAS-55-7BCA479B",
      amount: "99999",
      currency: 566,
      site_redirect_url: "./",
      split_accounts:
        '[{"alias":"qr_thing","amount":"","percentage":"90","description":"tuition","isPrimary":"true"},{"alias":"qq1111","amount":"","percentage":"10","description":"housing"}]',
      onComplete: () => {},
      mode: "TEST"
    };

    this.setUpPayment();
  }

  setEmitters() {
    if (this.callback.observers.length) {
      this.request.onComplete = (...response) => {
        this.callback.emit(...response);
      };
    }
  }

  setUpPayment() {
    this.setEmitters();
    this.script = this.renderer.createElement("script");
    this.renderer.setAttribute(this.script, "src", this.iswPaymentGateway);

    this.renderer.appendChild(this.document.head, this.script);
  }

  @HostListener("click")
  pay() {
    try {
      window.webpayCheckout(this.request);
    } catch (e) {
      console.log(e);
    }
  }
}
